import GridList from "sap/f/GridList";
import GridListItem from "sap/f/GridListItem";
import Controller from "sap/fe/core/PageController";
import ListItemBase from "sap/m/ListItemBase";
import SegmentedButton from "sap/m/SegmentedButton";
import SelectList from "sap/m/SelectList";
import Event from "sap/ui/base/Event";
import Binding from "sap/ui/model/Binding";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import JSONModel from "sap/ui/model/json/JSONModel";
import VizFrame from "sap/viz/ui5/controls/VizFrame";
import FlattenedDataset from "sap/viz/ui5/data/FlattenedDataset";
import Formatter from "../main/formatters/formatter";
import ComboBox from "sap/m/ComboBox";
import MultiComboBox from "sap/m/MultiComboBox";
import FeedItem from "sap/viz/ui5/controls/common/feeds/FeedItem";


/**
 * @namespace ts.projectcrypto.ext.view
 */
export default class Wizard extends Controller {

    /**
     * Called when a controller is instantiated and its View controls (if available) are already created.
     * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
     * @memberOf ts.projectcrypto.ext.view.Wizard
     */
    public formatter = Formatter;
    
    public onInit(): void {
        super.onInit(); 
        const wizardModel : JSONModel = new JSONModel(); 
        wizardModel.loadData("ext/models/WizardModel.json"); 
        this.getView()?.setModel(wizardModel, "wizModel");
    }

    /**
     * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
     * (NOT before the first rendering! onInit() is used for that one!).
     * @memberOf ts.projectcrypto.ext.view.Wizard
     */
    public onBeforeRendering(): void {
       this.getView()?.bindElement({ 
          path: "/CryptoCurrencies", 
          parameters: { 
              "$select" : "ID,name,HasActiveEntity"
          }
      })
     }

     onPressGirdItem(event : any): void { 
        const source = event?.getSource();
        source?.getSelected() ? source.setSelected(false) : source.setSelected(true);
     }

     onCompletedWizard() : void { 
        (this?.getModel("wizModel") as JSONModel)?.setProperty("/visiblePage", false);

         const selectList : string = (this?.byId("_IDGenSelectList1") as SelectList)?.getSelectedKey();
         const selectButton : string = (this.byId("_IDGenSegmentedButton1") as SegmentedButton)?.getSelectedKey(); 
         const selectGridList : any[] = (this.byId("gridList") as GridList)?.getSelectedItems(); 
         const selectedMeasures : Filter[] = []; 
         const selectedMeasuresEntity : string[] = (this?.byId("_IDGenMultiComboBox") as MultiComboBox)?.getSelectedKeys();
         const measuresArray : any[] = [];

         const vizChartReview : VizFrame = this.byId("idVizFrameReviewWizard") as VizFrame;
         
         selectGridList.forEach((element)=> { 
            let symbol : string = element.getContent().at(0).getAggregation("items").at(2).getProperty("text");
            selectedMeasures.push(new Filter({ path: "symbol", operator: FilterOperator.EQ, value1: symbol }));
         });

         // add dimension feed 
         let feedValueDim : FeedItem = new FeedItem({
            'uid': `${selectButton}Axis`,
            'type': "Dimension",
            'values': ["timestamp"]
        }); 

        vizChartReview.addFeed(feedValueDim);

         selectedMeasuresEntity.forEach((element) => { 
            measuresArray.push({
                        name: element,
                        value: `{${element}}`
            });

            //add feeds  
            let feedValueMeasure : FeedItem = new FeedItem({
               'uid': `${element}Axis` as string,
               'type': "Measure" as string,
               'values': [element]
           });

           vizChartReview.addFeed(feedValueMeasure);
         });

         vizChartReview.setVizType(selectList);

         let dataSetObject : any = {
                  dimensions: [{
                        name: 'timestamp',
                        value: `{${selectButton}}`,
                        dataType:'date'
                  }],
                  measures: measuresArray,
                  data: {
                        path: "/SortedCrypto"
                  }
               };
         let dataSet : FlattenedDataset = new FlattenedDataset(dataSetObject);
         
         let reviewFilter : Filter = new Filter({
            filters : selectedMeasures,
            and : true
         });

         vizChartReview?.setDataset(dataSet);

         (vizChartReview.getDataset().getBinding("data") as any)?.filter(reviewFilter);

         vizChartReview?.setVizProperties({ 
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

     onBackToWizard () : void { 
      (this?.getModel("wizModel") as JSONModel)?.setProperty("/visiblePage", true);
     }

     onSaveChartBuilder() : void { 

     }
}