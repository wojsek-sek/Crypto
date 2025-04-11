import Controller from "sap/fe/core/PageController";
import JSONModel from "sap/ui/model/json/JSONModel";
import Formatter from "./formatters/formatter";
import { ComboBox$SelectionChangeEvent } from "sap/m/ComboBox";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import FlattenedDataset from "sap/viz/ui5/data/FlattenedDataset";
import VizFrame from "sap/viz/ui5/controls/VizFrame";
import Fragment from "sap/ui/core/Fragment";
import Device from "sap/ui/Device";
import Button, { Button$PressEvent } from "sap/m/Button";
import Routing from "sap/fe/core/controllerextensions/Routing";
import Context from "sap/ui/model/Context";
import Event from "sap/ui/base/Event";
import { DatePicker$ChangeEvent } from "sap/m/DatePicker";




type symbolType = { 
    symbol: string;
    name : string;
}

/**
 * @namespace ts.projectcrypto.ext.main
 */
export default class Main extends Controller {

    public formatter = Formatter;
    private Popover : any;
    private coinFilter : Filter = new Filter({ path: "symbol", operator: FilterOperator.EQ, value1: "BTC" });
    private filtersWithDate : Filter;
    private dateStart : string; 
    private dateEnd : string;

    /**
     * Called when a controller is instantiated and its View controls (if available) are already created.
     * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
     * @memberOf ts.projectcrypto.ext.main.Main
     */
    public onInit(): void {
        super.onInit(); // needs to be called to properly initialize the page controller
        const model = this.getAppComponent().getModel();
        let oModelData : JSONModel = new JSONModel({ 
            "items" : [],
            "title" : "Bitcoin"
        });
        this.getView()?.setModel(oModelData, "uniqueCoins");
        let data : any = model?.bindList("/CryptoCurrencies"); 
        data.requestContexts(0,20).then((contexts: any) => { 
            let statusData : symbolType[] = contexts.map((context: { getObject: () => any; }) => {  return  { symbol : context.getObject().symbol, name : context.getObject().name } }); 
            let uniqueSymbolsData : symbolType[] = this.getUniqueSymbols(statusData); 
            oModelData.setProperty("/items", uniqueSymbolsData);
         });


        this.dateStart = new Date().toISOString().replace(/T.*Z$/, "T00:00:00.000Z");
        this.dateEnd = new Date().toISOString().replace(/T.*Z$/, "T23:59:59.999Z");  
        
        let Chart : VizFrame | any = this.byId("idVizFrame");

        Chart?.setVizProperties({ 
            plotArea: {
                marker : { visible : false, 
                    size : "4"
                 },
                drawingEffect: "line",
                window: {
                    start: "firstDataPoint",
                    end: "lastDataPoint"
                },
                dataPointStyle: {
                    "rules":
                    [
                        {
                            "dataContext" : { measureNames : "changeValue"},
                            "properties": {
                                "color":"sapUiChartPaletteSemanticBad",
                            },
                            "displayName":"Down", 
                            "callback" : (data : any)=> { 
                                return data.price < 0;
                            }
                        },
                        {
                            "dataContext" : { measureNames : "changeValue"},
                            "properties": {
                                "color":"sapUiChartPaletteSemanticGood",
                            },
                            "displayName":"Up", 
                            "callback" : (data : any)=> {
                                return data.price > 0;
                            }
                        }
                    ],
                    "others":
                    {
                        "properties": {
                             "color": "#072A6C",
                             "displayName":"Line",
                        }
                    }
                }
            },
            valueAxis: {
                visible: true,
                title: {
                    visible: false
                }
            },
            timeAxis: {
                interval : {
                    unit : ''
                }
            },
            title: {
                visible: false
            },
            interaction: {
                syncValueAxis: false
            }
        });

    }

    onAfterRendering(): void | undefined {
        this.filtersWithDate = new Filter({
            filters : [
                this.coinFilter,
                new Filter({ path: "timestamp", operator: FilterOperator.GE, value1: this.dateStart }),
                new Filter({ path: "timestamp", operator: FilterOperator.LE, value1: this.dateEnd }),
                ],
            and : true
        })
        
        let Chart : VizFrame | any = this.byId("idVizFrame");
        let ChartData : FlattenedDataset | any = Chart.getDataset();
        let chartBinding = ChartData?.getBinding("data");
        chartBinding.filter(this.filtersWithDate);

    }

    getUniqueSymbols(data : Array<symbolType>): Array<symbolType> { 
        const uniqueSymbols = [... new Map(data.map(item => [item.symbol, item])).values()];
        return uniqueSymbols;
    }

    onPressFetch(): void { 
        let oModel = (this.getModel() as JSONModel);
        let oPeration: any = oModel.bindContext("/triggerCryptoCurrency(...)"); 
        oPeration.execute().then(() => { 
            oModel.refresh();
        });
    }

    onSelectionFinishConis(event : ComboBox$SelectionChangeEvent) : void { 
        let selectedData = event.getParameter("selectedItem");
        let text : string | undefined = selectedData?.getKey();
        let title : string | undefined = selectedData?.getText();
        
        this.coinFilter = new Filter({ path: "symbol", operator: FilterOperator.EQ, value1: text }); 
        let Chart : VizFrame | any= this.byId("idVizFrame");
        let ChartData : FlattenedDataset | any = Chart.getDataset();

        this.filtersWithDate = new Filter({
            filters : [
                this.coinFilter,
                new Filter({ path: "timestamp", operator: FilterOperator.GE, value1: this.dateStart }),
                new Filter({ path: "timestamp", operator: FilterOperator.LE, value1: this.dateEnd }),
                ],
            and : true
        })

        ChartData?.getBinding("data").filter(this.filtersWithDate);
        Chart?.setVizProperties({ 
            title : { 
                text : title
            }
        });
    }

    onSelectionFinishChart(event : ComboBox$SelectionChangeEvent) : void  {
        let selectedData = event.getParameter("selectedItem");
        let typeChart : string | undefined = selectedData?.getKey();
        let Chart : VizFrame | any = this.byId("idVizFrame");
        let dataType : string = typeChart === "line" ? "{price}" : "{changeValue}";

        Chart?.setVizType(typeChart);
        
        let dataSetObject : any = {
            dimensions: [{
                name: 'timestamp',
                value: "{timestamp}",
                dataType:'date'
            }],
            measures: [{
                name: 'price',
                value: dataType
            }],
            data: {
                path: "/SortedCrypto"
            }
        };
        let dataSet : FlattenedDataset | any = new FlattenedDataset(dataSetObject);
        Chart?.setDataset(dataSet);
        
        Chart?.getDataset().getBinding("data").filter(this.filtersWithDate);
    }

    onSwitchMenuOpen(event : Button$PressEvent) { 
        let view = this.getView();
        let that = this; 
        if (!this.Popover) {
            this.Popover = Fragment.load({
                id: view?.getId(),
                name: "ts.projectcrypto.ext.fragments.switchmenu",
                controller: this
            }).then(function(oPopover : any){
                view?.addDependent(oPopover);
                if (Device.system.phone) {
                    oPopover.setEndButton(new Button({text: "Close", type: "Emphasized", press: that.onSwitchMenuClose.bind(that)}));
                }
                return oPopover;
            }.bind(this));
        }

        this.Popover.then(function(oPopover : any){
            oPopover.openBy(event.getSource());
        });
    }

    onSwitchMenuClose () {
        this.Popover.then(function(oPopover : any){
            oPopover.close();
        });
    }

    onSwitchMenuChange () { 
        const router : Routing = this.getExtensionAPI().getRouting();
        router.navigateToRoute("CryptoCurrenciesWizardPage");
    }

    onOpenDateRangeSelection (event : Button$PressEvent) { 
        this.getView()?.byId("HiddenDRS")?.openBy(event.getSource().getDomRef());

    }

    onChangeDateHandler (event : DatePicker$ChangeEvent) { 
        let dates : string | undefined = event.getParameter("value");
        let datesArray : string[] | undefined = dates?.split("-");
        this.dateStart = new Date(datesArray?.at(0) as string).toISOString(); 
        this.dateEnd = new Date(datesArray?.at(1) as string).toISOString();

        this.filtersWithDate = new Filter({
            filters : [
                this.coinFilter,
                new Filter({ path: "timestamp", operator: FilterOperator.GE, value1: this.dateStart }),
                new Filter({ path: "timestamp", operator: FilterOperator.LE, value1: this.dateEnd }),
                ],
            and : true
        })
        let Chart : VizFrame | any= this.byId("idVizFrame");
        let ChartData : FlattenedDataset | any = Chart.getDataset();

        ChartData?.getBinding("data").filter(this.filtersWithDate);
    }


}