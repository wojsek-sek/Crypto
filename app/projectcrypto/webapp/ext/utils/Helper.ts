import Controller from "sap/ui/core/mvc/Controller";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import FeedItem from "sap/viz/ui5/controls/common/feeds/FeedItem";
import VizFrame from "sap/viz/ui5/controls/VizFrame";
import FlattenedDataset from "sap/viz/ui5/data/FlattenedDataset";

export default class Helper { 

    public static makeChart(name : string, type : string, measures : string[], dimension : string, coin : string, id : string, that : Controller) : void{
        const selectList : string = type;
        const selectButton : string = dimension; 
        const selectGridList : string = coin; 
        const selectedMeasuresEntity : string[] = measures;
        const measuresArray : any[] = [];
        const feedMeaasures : FeedItem[] = [];

        const vizChartReview : VizFrame = that.byId(id) as VizFrame;

        vizChartReview.setVizProperties({ 
            title : { 
                text : name,
                visible : true
            }
        });
    
        let selectedCoin : Filter = new Filter({ path: "symbol", operator: FilterOperator.EQ, value1: selectGridList });
         
        selectedMeasuresEntity.forEach((element) => { 
            measuresArray.push({
                        name: element,
                        value: `{${element}}`
            });

            //add feeds to feeds measure array
            feedMeaasures.push(new FeedItem({
                'uid': `valueAxis` as string,
                'type': "Measure" as string,
                'values': [element]
            }));

        });

        vizChartReview.setVizType(selectList);
        
        //set DataSet
        let dataSetObject : any = {
                dimensions: [{
                    name: 'timestamp',
                    value: `{${selectButton}}`,
                    dataType: 'date'
                }],
                measures: measuresArray,
                data: {
                    path: "/SortedCrypto"
                }
            };
        let dataSet : FlattenedDataset = new FlattenedDataset(dataSetObject);
    

        vizChartReview?.setDataset(dataSet);

        (vizChartReview.getDataset().getBinding("data") as any)?.filter(selectedCoin);

        // add dimension feed 
        let feedValueDim : FeedItem = new FeedItem({
            'uid': `categoryAxis`,
            'type': "Dimension",
            'values': [selectButton]
        }); 

        vizChartReview.addFeed(feedValueDim);

        feedMeaasures.forEach((element)=> { 
            vizChartReview.addFeed(element);
        });
    }
}