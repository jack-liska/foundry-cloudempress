/**
 * Extend the basic MothershipItemSheet for age items
 * @extends {MothershipItemSheet}
 */
import { MothershipItemSheet } from "./item-sheet.js";
export class MothershipAgeSheet extends MothershipItemSheet {

  /** @override */
  static get defaultOptions() {
    var options = {
      classes: ["mosh", "sheet", "item"],
      width: 820,
      height: 600,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
    };
    options.dragDrop = [{dragSelector: null, dropSelector: ".dropitem"}];

    return foundry.utils.mergeObject(super.defaultOptions, options);
  }

  /** @override */
  async getData() {
    const data = await super.getData();

    // Initialize items_granted array if it doesn't exist
    if (typeof data.system.base_adjustment.items_granted == 'undefined'){
      data.system.base_adjustment.items_granted = [];
    }

    // Create placeholder for the items object, to get the info of the item
    data.system.base_adjustment.items_granted_object = [];
    for (const itemUuid of data.system.base_adjustment.items_granted){
      data.system.base_adjustment.items_granted_object.push(await fromUuid(itemUuid));
    }

    // Enrich description for display
    data.enriched = [];
    data.enriched.description = await TextEditor.enrichHTML(data.system.description, {async: true});

    return data;
  }

  async _onDrop(event){
    const droppedUuid = TextEditor.getDragEventData(event);
    if (droppedUuid.type != "Item"){
       return super._onDrop(event);
    }

    const droppedObject = await fromUuid(droppedUuid.uuid);

    // Prevent default immediately to avoid race conditions
    event.preventDefault();
    event.stopPropagation();

    // Handle item drops for items.granted tab
    if(event.currentTarget == null) {
        ui.notifications.error("No drop target found");
        return this.render(false);
    }

    if(event.currentTarget.id == "items.granted"){
      let items = this.object.system.base_adjustment.items_granted;
      if (items.includes(droppedObject.uuid)){
        ui.notifications.warn("Item is already in the list");
        return this.render(false);
      }
      items.push(droppedObject.uuid);
      this.object.update({"system.base_adjustment.items_granted": items});
      return this.render(false);
    }

    // If we get here, the drop target wasn't recognized
    return this.render(false);
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Prevent default dragover behavior to allow dropping
    html[0].addEventListener('dragover', (event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'copy';
    });

    // Delete items-granted
    html.find('.items-granted-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");

      let items = this.object.system.base_adjustment.items_granted.filter(function(obj) {
          return obj !== li.data("itemId");
      });
      this.object.update({"system.base_adjustment.items_granted": items});
      return this.render(false);
    });
  }
}
