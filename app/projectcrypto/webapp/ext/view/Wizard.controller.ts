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
import Input, { Input$LiveChangeEvent } from "sap/m/Input";
import WizardStep from "sap/m/WizardStep";
import { MultiComboBox$ChangeEvent } from "sap/ui/webc/main/MultiComboBox";
import Model from "sap/ui/model/Model";
import ODataModel from "sap/ui/model/odata/v4/ODataModel";
import Context from "sap/ui/model/odata/v4/Context";
import MessageToast from "sap/m/MessageToast";
import ChartContainerContent from "sap/suite/ui/commons/ChartContainerContent";
import ChartContainer from "sap/suite/ui/commons/ChartContainer";
import ListBase, { ListBase$SelectionChangeEvent } from "sap/m/ListBase";
import Helper from "../utils/Helper";
import Routing from "sap/fe/core/controllerextensions/Routing";


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
        const inputName : string = (this?.byId("_IDGenInput") as Input).getValue();
        const selectList : string = (this?.byId("_IDGenSelectList1") as SelectList)?.getSelectedKey();
        const selectButton : string = (this.byId("_IDGenSegmentedButton1") as SegmentedButton)?.getSelectedKey(); 
        const selectGridList : any = (this.byId("gridList") as GridList)?.getSelectedItem(); 
        const selectedMeasuresEntity : string[] = (this?.byId("_IDGenMultiComboBox") as MultiComboBox)?.getSelectedKeys();

        let symbol : string = selectGridList.getContent().at(0).getAggregation("items").at(2).getProperty("text");

        Helper.makeChart(inputName, selectList, selectedMeasuresEntity, selectButton, symbol, "idVizFrameReviewWizard", this);
    
     }

     onBackToWizard () : void { 
      (this?.getModel("wizModel") as JSONModel)?.setProperty("/visiblePage", true);
     }

     onSaveChartBuilder () : void { 
        const inputName : string = (this?.byId("_IDGenInput") as Input).getValue();
        const selectType : string = (this?.byId("_IDGenSelectList1") as SelectList)?.getSelectedKey();
        const selectDimension : string = (this.byId("_IDGenSegmentedButton1") as SegmentedButton)?.getSelectedKey(); 
        const selectCoin : any = (this.byId("gridList") as GridList)?.getSelectedItem(); 
        const selectedMeasures : string[] = (this?.byId("_IDGenMultiComboBox") as MultiComboBox)?.getSelectedKeys();
        let symbolCoin : string = selectCoin.getContent().at(0).getAggregation("items").at(2).getProperty("text");

        const entry = { 
            name : inputName, 
            type : selectType,
            measures : selectedMeasures,
            dimension : selectDimension,
            coin : symbolCoin 
        };

        const modelUserChart : ODataModel = (this.getModel() as ODataModel);
        const contextCreated : Context = modelUserChart.bindList("/UserChart").create(entry);

        (contextCreated.created() as Promise<void>).then(() => { 
            MessageToast.show("Chart was created succesfully.", {
                duration: 3000
            });

            this._onResetWizard();
        });

     }

     onSubmitChange(event : Input$LiveChangeEvent) : void { 
        if((event.getParameter("value") as string).length >= 10) { 
            (this?.getModel("wizModel") as JSONModel)?.setProperty("/inputState", "Success");
            (this.byId("ChartName") as WizardStep).setValidated(true);
        } else {  
            (this?.getModel("wizModel") as JSONModel)?.setProperty("/inputState", "Error");
        }
     }

     onMeasureStepChange(event : Event) : void { 
        const measureStep : WizardStep = this.byId("MeasureStep") as WizardStep;
        (event.getSource() as MultiComboBox).getSelectedKeys().length === 0 ? measureStep.setValidated(false) : measureStep.setValidated(true);
     }

     onGridListSelectionChange(event : ListBase$SelectionChangeEvent) { 
        const coinStep : WizardStep= this.byId("CoinStep") as WizardStep;
        (event.getSource() as ListBase).getSelectedItem() ? coinStep.setValidated(true) : coinStep.setValidated(false); 
     }

     _onResetWizard() : void { 
        (this?.getModel("wizModel") as JSONModel)?.setProperty("/visiblePage", true);
        (this?.getModel("wizModel") as JSONModel)?.setProperty("/inputState", "Information");

        (this.byId("MeasureStep") as WizardStep).setValidated(false);
        (this.byId("ChartName") as WizardStep).setValidated(false);

        (this.byId("_IDGenInput") as Input).setValue(""); 
        (this.byId("_IDGenSelectList1") as SelectList).setSelectedKey("area");
        (this.byId("_IDGenMultiComboBox") as MultiComboBox).clearSelection();
        (this.byId("_IDGenSegmentedButton1") as SegmentedButton).setSelectedButton("_IDGenSegmentedButtonItem");
        (this.byId("gridList") as GridList).setSelectedItemById("");

        const router : Routing = this.getExtensionAPI().getRouting();
        router.navigateToRoute("CryptoCurrenciesMain");
     }
}