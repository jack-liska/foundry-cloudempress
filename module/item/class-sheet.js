/**
 * Extend the basic MothershipItemSheet with class modification
 * @extends {MothershipItemSheet}
 */
import { MothershipItemSheet } from "./item-sheet.js";
export class MothershipClassSheet extends MothershipItemSheet {

  /** @override */
  static get defaultOptions() {
    var options = {
      classes: ["mosh", "sheet", "item"],
      width: 820,
      height: 820,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
    };
    options.dragDrop = [{dragSelector: null, dropSelector: ".dropitem"}];

    return foundry.utils.mergeObject(super.defaultOptions, options);
    
  }


  /** @override */
  async getData() {
    const data = await super.getData();
    if (typeof data.system.base_adjustment.skills_granted == 'undefined'){
      data.system.base_adjustment.skills_granted=[];
    }

    //Create placeholder for the skills object, to get the info of the skill
    data.system.base_adjustment.skills_granted_object = [];
    for (const skill of data.system.base_adjustment.skills_granted){ 
        data.system.base_adjustment.skills_granted_object.push(await fromUuid(skill));
    };

    console.log(data.system.selected_adjustment.choose_skill_or);
    let choose_skill_or = data.system.selected_adjustment.choose_skill_or;
    for (const [ig, group] of choose_skill_or.entries()){
      for (const [io, option] of group.entries()){
        let names = [];
        data.system.selected_adjustment.choose_skill_or[ig][io].from_list_names = [];
        for(const [is,  skill] of option.from_list.entries()){
          names.push((await fromUuid(skill)).name);
        }
        data.system.selected_adjustment.choose_skill_or[ig][io].from_list_names = names;
      }
      console.log(data.system.selected_adjustment.choose_skill_or);
    }

    data.system.common_skills_object = [];
    for (const skill of data.system.common_skills){ 
      data.system.common_skills_object.push(await fromUuid(skill));
    };

    /*
    if (typeof data.system.selected_adjustment.choose_stat.stats == 'undefined'){
      data.system.selected_adjustment.choose_stat.stats=[];
    }*/

    data.enriched=[];
    data.enriched.description = await TextEditor.enrichHTML(data.system.description, {async: true});

    return data;
  }

  async _onDrop(event){
    const droppedUuid = TextEditor.getDragEventData(event);
    if (droppedUuid.type != "Item"){
       return super._onDrop(event);
    }

    const droppedObject = await fromUuid(droppedUuid.uuid);

    // Only handle skill items specially, let everything else use default behavior
    if (droppedObject.type != "skill"){
      return super._onDrop(event);
    }

    // Prevent default immediately for skill drops to avoid race conditions
    event.preventDefault();
    event.stopPropagation();

    // Handle skill drops - we don't call super because we only want to reference skills, not embed them
    if(event.currentTarget == null) {
        ui.notifications.error(game.i18n.localize("Mosh.Errors.NoDropTarget"));
        return this.render(false);
    }

    console.log(event.currentTarget.id);

    if(event.currentTarget.id == "skills.fixed"){
      let parent_fixed_or = event.target.closest('div[id="skills.fixed.or"]');

      if(parent_fixed_or){
        let array_index = parent_fixed_or.getAttribute("index");
        let skills = this.object.system.base_adjustment.skills_granted;
        if(skills[array_index].includes(droppedObject.uuid)){
          ui.notifications.warn(game.i18n.localize("Mosh.Errors.SkillAlreadyInList"));
          return this.render(false);
        }
        skills[array_index].push(droppedObject.uuid);
        this.object.update({"system.base_adjustment.skills_granted":skills});
        return this.render(false);

      }else{
        let skills = this.object.system.base_adjustment.skills_granted;
        if (skills.includes(droppedObject.uuid)){
          ui.notifications.warn(game.i18n.localize("Mosh.Errors.SkillAlreadyInList"));
          return this.render(false);
        }
        skills.push(droppedObject.uuid);
        this.object.update({"system.base_adjustment.skills_granted":skills});
        return this.render(false);
      }
    }
    else if(event.currentTarget.id =="skills.common"){
      let skills = this.object.system.common_skills;
      if (skills.includes(droppedObject.uuid)){
        ui.notifications.warn(game.i18n.localize("Mosh.Errors.SkillAlreadyInList"));
        return this.render(false);
      }
      skills.push(droppedObject.uuid);
      this.object.update({"system.common_skills":skills});
      return this.render(false);
    }
    else if(event.currentTarget.id =="choose_skill_or_li"){
      const li = $(event.currentTarget);
      let index = li.data("itemId");
      const parent = $(event.currentTarget).parents(".items-list");
      let parent_index = parent.data("itemId");

      let options = this.object.system.selected_adjustment.choose_skill_or;
      if(options[parent_index][index].from_list.includes(droppedObject.uuid)){
        ui.notifications.warn(game.i18n.localize("Mosh.Errors.SkillAlreadyInList"));
        return this.render(false);
      }
      options[parent_index][index].from_list.push(droppedObject.uuid);

      this.object.update({"system.selected_adjustment.choose_skill_or":options});
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

    // Delete skills-granted
    html.find('.skills-granted-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      
      let skills = this.object.system.base_adjustment.skills_granted.filter(function( obj ) {
          return obj !== li.data("itemId");
      });
      this.object.update({"system.base_adjustment.skills_granted":skills});
      return this.render(false);
    });
    
    // Delete skills-common
    html.find('.skills-common-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      
      let skills = this.object.system.common_skills.filter(function( obj ) {
          return obj !== li.data("itemId");
      });
      this.object.update({"system.common_skills":skills});
      return this.render(false);
    });

    html.find('.stat-option-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      
      let stats = this.object.system.selected_adjustment.choose_stat;
      stats.splice(li.data("itemId"),1);

      this.object.update({"system.selected_adjustment.choose_stat":stats});
      return this.render(false);
    });


    html.find('.stat-option-add').click(this._onStatCreate.bind(this));


    html.find('.skills-group-add').click(ev => {
      let skills = this.object.system.selected_adjustment.choose_skill_or;
      let new_group = []
      skills.push(new_group);
      this.object.update({"system.selected_adjustment.choose_skill_or":skills});
      return this.render(false);
    });
    html.find('.skills-group-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".items-list");
    
      let options = this.object.system.selected_adjustment.choose_skill_or;
      options.splice(li.data("itemId"),1);

      this.object.update({"system.selected_adjustment.choose_skill_or":options});
      return this.render(false);
    });

    html.find('.skills-group-option-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const liparent = li.parents(".items-list");
    
      let options = this.object.system.selected_adjustment.choose_skill_or;
      options[liparent.data("itemId")].splice(li.data("itemId"),1);

      this.object.update({"system.selected_adjustment.choose_skill_or":options});
      return this.render(false);
    });

    html.find('.skills-group-option-createnew').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const parent_list = li.parents(".items-list");
      const parent_index = parent_list.data("itemId");

      // Get the name input value
      const nameInput = li.find('input[name="choose_skill_or_name"]');
      let name = nameInput.val();

      // If no name provided, generate a default one
      if(!name || name == ""){
        name = `Option ${(this.object.system.selected_adjustment.choose_skill_or[parent_index].length) + 1}`;
      }

      // Create new skill option with simplified structure
      let new_data = {
        "name": name,
        "from_list": []
      }

      // Add to the appropriate group
      let options = this.object.system.selected_adjustment.choose_skill_or;
      options[parent_index].push(new_data);

      //save data
      this.object.update({"system.selected_adjustment.choose_skill_or":options});

      //clear form
      nameInput.val("");

      return this.render(false);
    });

  }


    /**
   * Handle creating a new stat for the class selected adjustment
   * @param {Event} event   The originating click event
   * @private
   */
    _onStatCreate(event) {
      event.preventDefault();
      let choose_stat = this.object.system.selected_adjustment.choose_stat;

      let DialogContent = `
        <div class="macro_desc" style="margin-bottom : -5px;"><h4>${game.i18n.localize("Mosh.CharacterGenerator.StatOption")}</h4></div>\
        <div> <input type="number" id='modification' placeholder="${game.i18n.localize("Mosh.Value")}" /></label></div>\
        <div> <input type="checkbox" id='strength' />${game.i18n.localize("Mosh.Strength")}</label></div>\
        <div> <input type="checkbox" id='speed' />${game.i18n.localize("Mosh.Speed")}</label></div>\
        <div> <input type="checkbox" id='mind' />${game.i18n.localize("Mosh.Mind")}</label></div>\
        <div> <input type="checkbox" id='heart' />${game.i18n.localize("Mosh.Heart")}</label></div>\
        <div> <input type="checkbox" id='reality' />${game.i18n.localize("Mosh.Reality")}</label></div>\
        <div> <input type="checkbox" id='fear' />${game.i18n.localize("Mosh.Fear")}</label></div>\
        <div> <input type="checkbox" id='body' />${game.i18n.localize("Mosh.Body")}</label></div>
      `

      let d = new foundry.applications.api.DialogV2({
		    window: {title: `Select Stat`},
        classes: ["macro-popup-dialog"],
        content: DialogContent,
        buttons: [
          {
            icon: 'fas fa-check',
            action: "create",
            label: "Create",
            callback: (event, button, dialog) => {
              
            let new_stat_option = {
              modification: button.form.querySelector('[id=\"modification\"]').value,
              stats: [],
            }
            if (button.form.querySelector('[id=\"strength\"]')?.checked){
              new_stat_option.stats.push("strength");
            }
            if (button.form.querySelector('[id=\"speed\"]')?.checked){
              new_stat_option.stats.push("speed");
            }
            if (button.form.querySelector('[id=\"mind\"]')?.checked){
              new_stat_option.stats.push("mind");
            }
            if (button.form.querySelector('[id=\"heart\"]')?.checked){
              new_stat_option.stats.push("heart");
            }
            if (button.form.querySelector('[id=\"reality\"]')?.checked){
              new_stat_option.stats.push("reality");
            }
            if (button.form.querySelector('[id=\"fear\"]')?.checked){
              new_stat_option.stats.push("fear");
            }
            if (button.form.querySelector('[id=\"body\"]')?.checked){
              new_stat_option.stats.push("body");
            }
            if(new_stat_option.stats.length < 2){
              ui.notifications.error(game.i18n.localize("Mosh.classNewStatOptionEmptyError"));
              return;
            }

            choose_stat.push(new_stat_option);
            this.object.update({"system.selected_adjustment.choose_stat":choose_stat});

            }
          },
          {
            icon: 'fas fa-times',
            action: "cancel",
            label: "Cancel",
            callback: () => { }
          }
        ],
        default: "create",
        close: () => { }
      });
      d.render({force: true});
  
      // Finally, create the item!
      return;
    }
  
}

