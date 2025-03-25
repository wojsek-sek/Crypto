import Controller from "sap/fe/core/PageController";
import JSONModel from "sap/ui/model/json/JSONModel";
import Formatter from "./formatters/formatter";
import Event from "sap/ui/base/Event";
import { ComboBox$SelectionChangeEvent } from "sap/m/ComboBox";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import FlattenedDataset from "sap/viz/ui5/data/FlattenedDataset";
import VizFrame from "sap/viz/ui5/controls/VizFrame";
import ChartFormatter from "sap/viz/ui5/format/ChartFormatter";


type symbolType = { 
    symbol: string;
    name : string;
}

/**
 * @namespace ts.projectcrypto.ext.main
 */
export default class Main extends Controller {

    public formatter = Formatter;

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

        
        let Chart : VizFrame | any = this.byId("idVizFrame");

        Chart?.setVizProperties({ 
            plotArea: {
                window: {
                    start: "firstDataPoint",
                    end: "lastDataPoint"
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
        
        let filters : Filter[] = [new Filter({ path: "symbol", operator: FilterOperator.EQ, value1: text })]; 
        let ChartData : FlattenedDataset | any = this.byId("_IDGenFlattenedDataset1");
        let Chart : VizFrame | any = this.byId("idVizFrame");

        ChartData?.getBinding("data").filter(filters);

        Chart?.setVizProperties({ 
            title : { 
                text : title
            }
        });
    }

    onSelectionFinishChart(event : ComboBox$SelectionChangeEvent) : void  {
        let selectedData = event.getParameter("selectedItem");
        let typeChart : string | undefined = selectedData?.getKey();
        let Chart : VizFrame = this.byId("idVizFrame");
        let dataType : string = typeChart === "line" ? "{price}" : "{changeValue}";

        Chart?.setVizType(typeChart);
        Chart.destroyDataset();
        
        let dataSetObject = {
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
                path: "/CryptoCurrencies"
            }
        };

        let dataSet = new FlattenedDataset(dataSetObject);
        Chart?.setDataset(dataSet);
         
    }


}