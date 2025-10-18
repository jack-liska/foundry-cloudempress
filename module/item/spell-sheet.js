/**
 * Extend the basic MothershipItemSheet for spell items
 * @extends {MothershipItemSheet}
 */
import { MothershipItemSheet } from "./item-sheet.js";
export class MothershipSpellSheet extends MothershipItemSheet {

  /** @override */
  static get defaultOptions() {
    var options = {
      classes: ["mosh", "sheet", "item"],
      width: 600,
      height: 600,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "effect" }]
    };

    return foundry.utils.mergeObject(super.defaultOptions, options);
  }

  /** @override */
  async getData() {
    const data = await super.getData();

    data.enriched = [];
    data.enriched.description = await TextEditor.enrichHTML(data.system.description, {async: true});
    data.enriched.effect = await TextEditor.enrichHTML(data.system.effect, {async: true});
    data.enriched.afterEffect = await TextEditor.enrichHTML(data.system.afterEffect, {async: true});

    return data;
  }
}
