export class DLActorGenerator extends FormApplication {
   static get defaultOptions() {
      const options = super.defaultOptions;
      options.id = 'sheet-modifiers';
      options.classes = ["mosh", "sheet", "actor", "character"];
      options.template = 'systems/cloudempress/templates/dialogs/actor-generator-dialog.html';
      options.width = 800;
      options.height = "auto";
      options.dragDrop = [{ dragSelector: null, dropSelector: ".dropitem" }];
      return options;
   }

   /* -------------------------------------------- */
   /**
    * Add the Entity name into the window title
    * @type {String}
    */
   get title() {
      return `${this.object.name}: ${game.i18n.localize("Mosh.CharacterGenerator.name")}`;
   }
   /* -------------------------------------------- */

   /**
    * Construct and return the data object used to render the HTML template for this form application.
    * @return {Object}
    */
   async getData() {
      //if (this.object.system.class.uuid != null){
      //   this.updateClass(this.object.system.class.uuid);
      //}
      let data = this.object;

      data.system.class = [];
      data.system.class.value = "";
      data.system.class.skills = [];
      data.system.class.skills.uuid = [];
      return data;
   }
   /* -------------------------------------------- */

   async rollDices(dices, html, id, chatmsg = "") {

      if (html.find(`img[id="${id}"]`).prop('hidden') == false) {
         let roll = await new Roll(dices).roll();
         if (chatmsg != "") {
            await roll.toMessage({ flavor: chatmsg });
         }
         //console.log(id + "->" + roll.total)
         html.find(`img[id="${id}"]`).prop('hidden', true);
         html.find(`input[id="${id}"]`).prop('hidden', false);
         html.find(`input[id="${id}"]`).prop('value', roll.total);
      }
   }


   /* todo: remove pre-defined values and set the values as configuration /maybe part of class-item¿? */
   async rollStrength(html) {
      this.rollDices("2d10+20", html, `system.stats.strength.value`, game.i18n.format("Mosh.RollingForGeneric",{
         name:game.i18n.localize("Mosh.Strength")
      }))
   }
   async rollSpeed(html) {
      this.rollDices("2d10+20", html, `system.stats.speed.value`,  game.i18n.format("Mosh.RollingForGeneric",{
         name:game.i18n.localize("Mosh.Speed")
      }))
   }
   async rollMind(html) {
      this.rollDices("2d10+20", html, `system.stats.mind.value`, game.i18n.format("Mosh.RollingForGeneric",{
         name:game.i18n.localize("Mosh.Mind")
      }))
   }
   async rollHeart(html) {
      this.rollDices("2d10+20", html, `system.stats.heart.value`,  game.i18n.format("Mosh.RollingForGeneric",{
         name:game.i18n.localize("Mosh.Heart")
      }))
   }
   async rollReality(html) {
      this.rollDices("1d10+20", html, `system.stats.reality.value`,  game.i18n.format("Mosh.RollingForGeneric",{
         name:game.i18n.localize("Mosh.Reality")
      }))
   }
   async rollFear(html) {
      this.rollDices("1d10+20", html, `system.stats.fear.value`,  game.i18n.format("Mosh.RollingForGeneric",{
         name:game.i18n.localize("Mosh.Fear")
      }))
   }
   async rollBody(html) {
      this.rollDices("1d10+20", html, `system.stats.body.value`,  game.i18n.format("Mosh.RollingForGeneric",{
         name:game.i18n.localize("Mosh.Body")
      }))
   }

   async rollTable(html, id, tableId, type = "input") {

      if (html.find(`img[id="` + id + `.value"]`).prop('hidden') == false && html.find(`img[id="system.class.value"]`).prop('value') != "") {

         let table = await fromUuid(tableId);
         if (!table) {
            ui.notifications.error(game.i18n.localize("Mosh.CharacterGenerator.Error.NoTable"));
            return;
         }
         let tableResult = await table.draw({ displayChat: true });

         let tableRoll = tableResult.results[0].range[0];

         let resultText = "";
         let resultUuid = [];
         for (var i = 0; i < tableResult.results.length; i++) {
            if (tableResult.results[i].type == "pack" || tableResult.results[i].type == "document") {
               if (type == "ul") {
                  this._element.find(`ul[id="${id}.text"]`).append(`<li>${tableResult.results[i].name}</li>`);
               } else {
                  resultText += tableResult.results[i].name + "; ";
               }
               resultUuid.push(tableResult.results[i].documentUuid);
            } else if (tableResult.results[i].type == "text") {
               let tableTextmatch = tableResult.results[i].description.match(/(.*)(@UUID.*)/i);
               if (type == "ul") {
                  this._element.find(`ul[id="${id}.text"]`).append(`<li>${await TextEditor.enrichHTML(tableTextmatch[2].replace(/(\<br\s\/>)+/i, ""), { async: true })}</li>`);
               }
               else {
                  resultText += tableTextmatch[1].replace(/(\<br\s\/>)+/i, "");
               }
               /**we need to keep only the id of the item, not the complete uuid string (for now) */
               resultUuid.push(tableTextmatch[2].replace(/(])+(.*)/i, "").replace(/(.*)(\.)/i, ""));
            }
         }

         html.find(`img[id="` + id + `.value"]`).prop('hidden', true);
         html.find(`input[id="` + id + `.value"]`).prop('hidden', false);
         html.find(`input[id="` + id + `.value"]`).prop('value', tableRoll);
         html.find(`input[id="` + id + `.text"]`).prop('hidden', false);
         html.find(`input[id="` + id + `.text"]`).prop('value', resultText);
         html.find(`input[id="` + id + `.uuid"]`).prop('value', resultUuid);

      }

   }



   /**
    * Trigger all the rolls
    * @param {*} html
    */
   async rollEverything(html) {
      await this.rollStrength(html);
      await this.rollSpeed(html);
      await this.rollMind(html);
      await this.rollHeart(html);
      await this.rollFear(html);
      await this.rollReality(html);
      await this.rollBody(html);
   }

   /**
    * popup to selecct from a list of fixed skills
    * @param {*} html 
    * @param {*} skillPopupOptions 
    * @returns 
    */
   async fixedSkillOptionPopup(html, skillPopupOptions) {
      return new Promise((resolve) => {
         if(skillPopupOptions.length == 0){
            resolve(null);
            return;
         }
         let buttons_options = [];
         for (let j = 0; j < skillPopupOptions.length; j++) {
            buttons_options.push({
               icon: 'fas fa-check',
			      action: skillPopupOptions[j].name,
               label: skillPopupOptions[j].name,
               callback: () => resolve(skillPopupOptions[j].uuid),
            });
         }
         let d = new foundry.applications.api.DialogV2({
		      window: {title: game.i18n.localize("Mosh.CharacterGenerator.StatOptionPopupTitle")},
            classes: ["macro-popup-dialog"],
            content: `<div class="macro_desc"><h4>${game.i18n.localize("Mosh.CharacterGenerator.StatOptionPopupText")}</h4></div>`,
            buttons: buttons_options,
            default: "1",
            //render: html => console.log("Register interactivity in the rendered dialog"),
            //close: html => console.log("This always is logged no matter which option is chosen")
         });
         d.render({force: true});
      });
   }

   /**
    * Apply the skills to the form, 
    * @param {*} html 
    * @param {[uuid]} skillsUuid List of skill uuid,
    * @returns 
    */
   async updateSkillHtmlUl(html, skillsUuid) {
      let new_skills =  await html.find(`input[id="system.class.skills.uuid"]`).prop("value").split(",").filter(Boolean);
      for (let i = 0; i < skillsUuid.length; i++) {
         let skill = null;
         //incase we have an array of arrays the second array is considered options
         //this is legacy, whe should never have this case anymore
         if(Array.isArray(skillsUuid[i])){
            //we have skill options, display popup to choose
            let options = [];
            for (let j = 0; j < skillsUuid[i].length; j++) {
               let skill = await fromUuid(skillsUuid[i][j]);
               options.push({"name":skill.name,"uuid":skill.uuid});
            }
            let skill_uuid = await this.fixedSkillOptionPopup(html,options);
            skill = await fromUuid(skill_uuid);

         }else{         
            //fixed skill, just add it to the list
            skill = await fromUuid(skillsUuid[i]);
         }
         new_skills.push(skill.uuid);
         /**we need to keep only the Uuid of the item, not the complete string (for now) */
         let li_html = `<li>${await TextEditor.enrichHTML(skill.name, { async: true })}</li>`;
         html.find(`ul[id="system.class.skils.text"]`).append(li_html);
         
      }
      html.find(`input[id="system.class.skills.uuid"]`).prop("value", new_skills.join(","));
      return new_skills;
   }

   /**
    * Process the skill options and display all the necesary popups
    * @param {*} skillPopupOptions 
    */
   async popUpSkillOptions(skillPopupOptions) {

      for (let i = 0; i < skillPopupOptions.master_full_set; i++) {
         await this.showSkillDialog('systems/cloudempress/templates/dialogs/actor-generator/actor-generator-skill-option-full-master-dialog.html');

      }
      for (let i = 0; i < skillPopupOptions.expert_full_set; i++) {
         await this.showSkillDialog('systems/cloudempress/templates/dialogs/actor-generator/actor-generator-skill-option-full-expert-dialog.html');

      }
      for (let i = 0; i < skillPopupOptions.trained; i++) {
         await this.showSkillDialog('systems/cloudempress/templates/dialogs/actor-generator/actor-generator-skill-option-single-dialog.html', "Trained");

      }
      for (let i = 0; i < skillPopupOptions.expert; i++) {
         await this.showSkillDialog('systems/cloudempress/templates/dialogs/actor-generator/actor-generator-skill-option-single-dialog.html', "Expert");

      }
      for (let i = 0; i < skillPopupOptions.master; i++) {
         await this.showSkillDialog('systems/cloudempress/templates/dialogs/actor-generator/actor-generator-skill-option-single-dialog.html', "Master");

      }
      //console.log(existingSkills);
      //return skillsUuid;
   }

   /**
    * Dialog with dropdown to select the skills, it grey-out already owned skills and filters the dropdown based on the skilltree of the previously selected skills,
    * the fill older is from master to trained.
    * @param {*} template 
    * @param {*} exclusive 
    * @returns 
    */
   async showSkillDialog(template, exclusive = false) {

      let skillsUuid = this.skillsUuid;

      let all_skills = await this.getAllSkills();
      all_skills.forEach((element, index) => {
         all_skills[index].disabled = (skillsUuid.includes(element.uuid) ? "disabled" : "");
      });


      let skillPopupData = {
         title: game.i18n.localize("Mosh.CharacterGenerator.SkillOption.PopupTitle"),
         existingSkills: skillsUuid,
         skills: {
            trained: all_skills.filter(i => i.system.rank == "Trained"),
            expert: all_skills.filter(i => i.system.rank == "Expert"),
            master: all_skills.filter(i => i.system.rank == "Master"),
         }
      };
      if (exclusive) {
         skillPopupData.description = game.i18n.localize("Mosh.CharacterGenerator.SkillOption.Popup" + exclusive + "Description");
         switch (exclusive) {
            case "Master":
               skillPopupData.skills = all_skills.filter(i => i.system.rank == "Master" && i.system.prerequisite_ids.filter(item => skillsUuid.includes(item)).length > 0);
               break;
            case "Expert":
               skillPopupData.skills = all_skills.filter(i => i.system.rank == "Expert" && i.system.prerequisite_ids.filter(item => skillsUuid.includes(item)).length > 0);
               break;
            case "Trained":
               skillPopupData.skills = all_skills.filter(i => i.system.rank == "Trained");
               break;
         }
      }

      let popUpContent = await renderTemplate(template, skillPopupData);

      return new Promise((resolve) => {
         let d = new foundry.applications.api.DialogV2({
		      window: {title: game.i18n.localize("Mosh.CharacterGenerator.SkillOption.PopupTitle")},
            classes: ["macro-popup-dialog"],
            content: popUpContent,
            buttons: [
               {
                  icon: 'fas fa-check',
			         action: `action_save`,
                  label: "Save",
                  callback: (event, button, dialog) => {
                     let form = button.form;
                     let formData = new FormData(form);
                     let new_skills = [];
                     formData.forEach((value, key) => {
                        if (value != "") {
                           new_skills.push(value);
                           this.skillsUuid.push(value);
                        }
                     });

                     this.updateSkillHtmlUl(this._element, new_skills);
                     resolve();
                  }
               }
            ],
            default: "1",
         });
         d.render({force: true});
      });
   }

   /**
    * Popup to ask the user to select what skill option to use,
    * @param {*} list_option_skills_or 
    * @returns 
    */
   async showOptionsDialog(list_option_skills_or) {
      let popupData = {options:list_option_skills_or};

      let popUpContent = await renderTemplate("systems/cloudempress/templates/dialogs/actor-generator/actor-generator-skill-option-choice-dialog.html", popupData);
      
      return new Promise((resolve) => {
         if(list_option_skills_or.length == 0){
            resolve(null);
            return;
         }
         let buttonsData = [];
         for (let i=0;i<list_option_skills_or.length;i++){
            buttonsData.push({
               icon: 'fas fa-check',
			      action: list_option_skills_or[i].name,
               label: list_option_skills_or[i].name,//game.i18n.localize("Mosh.CharacterGenerator.SkillOption.ChoiceWord") + ` ${i}`,
               callback: () => {
                  resolve(list_option_skills_or[i]);
               }
            });
         }
         let d = new foundry.applications.api.DialogV2({
		      window: {title: game.i18n.localize("Mosh.CharacterGenerator.SkillOption.PopupTitle")},
            classes: ["macro-popup-dialog"],
            content: popUpContent,
            window:{width: 500},
            buttons: buttonsData,
         });
         d.render({force: true});
      });
   }

   /**
    * Process all the skills for the selected class
    * @param {*} html 
    */
   async applyClassSkills(html) {
      let class_uuid = html.find(`input[id="system.class.uuid"]`).prop("value");
      if (class_uuid == "") {
         ui.notifications.error(game.i18n.localize("Mosh.CharacterGenerator.SkillOption.Classerror"));
         return;
      }
      let classObject = await fromUuid(class_uuid);
      //empty previously existing skills
      await html.find(`ul[id="system.class.skils.text"]`).empty();
      await html.find(`input[id="system.class.skills.uuid"]`).prop("value", "");

      //apply fixed skils
      this.skillsUuid = classObject.system.base_adjustment.skills_granted.slice();
      this.skillsUuid = await this.updateSkillHtmlUl(html, this.skillsUuid);

      //apply common skills
      if (classObject.system.common_skills && classObject.system.common_skills.length > 0) {
         this.skillsUuid = await this.updateSkillHtmlUl(html, classObject.system.common_skills);
      }

      //process optional skills
      let option_skills_and = classObject.system.selected_adjustment.choose_skill_and;
      await this.popUpSkillOptions(option_skills_and);

      let list_option_skills_or = classObject.system.selected_adjustment.choose_skill_or;
      for (let i = 0; i<list_option_skills_or.length;i++){
         let options_skill_or = list_option_skills_or[i];
         if(options_skill_or.length == 0){
            break;//empty list of options
         }
         let selected_option = options_skill_or[0];
         if(options_skill_or.length > 1){
            selected_option = await this.showOptionsDialog(options_skill_or);
         }
         //process fixed skills first, so we dont double select them
         if(selected_option.from_list.length>0){
            this.skillsUuid = await this.updateSkillHtmlUl(html, selected_option.from_list);
         }

         await this.popUpSkillOptions(selected_option);
         
      }
   }

   /**
    * Ask the user for the stat options, and apply the bonuses to the form.
    * @param {Array} list_option_stats_and_saves
    * @returns 
    */
   async statOptions(list_option_stats_and_saves){
      return new Promise((resolve) => {
         if(list_option_stats_and_saves.length == 0){
            resolve();
            return;
         }

         for(let i =0;i<list_option_stats_and_saves.length;i++){
            let option_stats_and_saves = list_option_stats_and_saves[i];
            if (option_stats_and_saves.modification) {
               let buttons_options = [];
               for (let j = 0; j < option_stats_and_saves.stats.length; j++) {
                  let prev_bonus = this._element.find(`input[name="system.stats.${option_stats_and_saves.stats[j]}.bonus"]`).prop("value");
                  buttons_options.push({
                     icon: 'fas fa-check',
                     action: option_stats_and_saves.stats[j],
                     label: option_stats_and_saves.stats[j],//.replace(/\.bonus/i,"").replace(/(.*)\.+/i,""),
                     callback: () => {this._element.find(`input[name="system.stats.${option_stats_and_saves.stats[j]}.bonus"]`).prop("value", (parseInt(option_stats_and_saves.modification) + parseInt(prev_bonus)));
                        resolve();
                     }
                  });
               }
               let d = new foundry.applications.api.DialogV2({
                  window: {title: game.i18n.localize("Mosh.CharacterGenerator.StatOptionPopupTitle")},
                  classes: ["macro-popup-dialog"],
                  content: `<div class="macro_desc"><h4>${game.i18n.localize("Mosh.CharacterGenerator.StatOptionPopupText")} (${option_stats_and_saves.modification})</h4></div>`,
                  buttons: buttons_options,
                  default: "1",
                  //render: html => console.log("Register interactivity in the rendered dialog"),
                  //close: html => console.log("This always is logged no matter which option is chosen")
               });
               d.render({force: true});
            }
         }
      });
   }

   /**
    * Apply the changed or dropped class into the generator, stats, skills and table configuration.
    * @param {uuid} classUuid 
    * @param {Boolean} randomCharacter 
    * @returns 
    */
   async updateClass(classUuid, randomCharacter = false) {

      const droppedObject = await fromUuid(classUuid);
      if (droppedObject.type != "class") {
         return;
      }
      this._element.find(`input[id="system.class.value"]`).prop("value", droppedObject.name);

      const prev_uuid = this._element.find(`input[id="system.class.uuid"]`).prop("value");
      if (prev_uuid != null) {
         //we already had a class, so we remove previously applied bonuses and skill

         //remove previous bonuses
         this._element.find(`input[name$="bonus"]`).prop("value", null)

      }
      //update form
      this._element.find(`input[id="system.class.uuid"]`).prop("value", classUuid);
      this._element.find(`input[id="system.class.traumaresponse"]`).prop("value", droppedObject.system.trauma_response);

      //Apply bonuses first, so if the popup are closed or crashed the bonuses are already applyed.
      let fix_stats_and_saves = droppedObject.system.base_adjustment;
      Object.entries(fix_stats_and_saves).forEach(([key, value]) => {
         if (key != "skills_granted") {
            //this sets all the bonuses of base_adjustment including max_wounds
            this._element.find(`input[name="system.stats.${key}.bonus"]`).prop("value", value);
         }
      });
       /**
       * Stats
       */
      //stats options
      await this.statOptions(droppedObject.system.selected_adjustment.choose_stat)

      /**
       *  Skills
       * */
      await this.applyClassSkills(this._element);

     
      return;
   }

   /**
    * Apply the changed or selected age into the generator, applying stat modifications.
    * @param {uuid} ageUuid
    * @returns
    */
   async updateAge(ageUuid) {

      const droppedObject = await fromUuid(ageUuid);
      if (droppedObject.type != "age") {
         return;
      }
      this._element.find(`input[id="system.other.age.value"]`).prop("value", droppedObject.name);

      const prev_uuid = this._element.find(`input[id="system.other.age.uuid"]`).prop("value");
      if (prev_uuid != null && prev_uuid != "") {
         //we already had an age, so we need to remove previously applied bonuses

         //Get the previous age item to subtract its bonuses
         const prevAge = await fromUuid(prev_uuid);
         if (prevAge) {
            let prev_adjustments = prevAge.system.base_adjustment;
            Object.entries(prev_adjustments).forEach(([key, value]) => {
               let currentBonus = parseInt(this._element.find(`input[name="system.stats.${key}.bonus"]`).prop("value")) || 0;
               this._element.find(`input[name="system.stats.${key}.bonus"]`).prop("value", currentBonus - value);
            });
         }
      }

      //update form with new age UUID
      this._element.find(`input[id="system.other.age.uuid"]`).prop("value", ageUuid);

      //Apply bonuses from new age
      let age_stats_adjustments = droppedObject.system.base_adjustment;
      Object.entries(age_stats_adjustments).forEach(([key, value]) => {
         let currentBonus = parseInt(this._element.find(`input[name="system.stats.${key}.bonus"]`).prop("value")) || 0;
         this._element.find(`input[name="system.stats.${key}.bonus"]`).prop("value", currentBonus + value);
      });

      return;
   }

   async _onDrop(event) {
      await super._onDrop(event);
      const droppedUuid = TextEditor.getDragEventData(event);
      if (droppedUuid.type != "Item") {
         return;
      }
      await this.updateClass(droppedUuid.uuid);
      //this._render();
   }

   async getAllSkills() {
      /**TODO: Get only player skills ?¿ there is no way to tell pet skills apart */
      let skills = game.items.filter(i => i.type == "skill");

      for (const [compendium_key, compendium_value] of game.packs.entries()) {
         let skillCompendium = await compendium_value.getDocuments({ type: "skill" });
         if (skillCompendium.length > 0) {
            skills = skills.concat(skillCompendium)
         }
      }
      return skills;
   }

   async fill_class_options(html) {

      let class_options = game.items.filter(i => i.type == "class");

      for (const [class_key, class_value] of class_options.entries()) {

         html.find(`datalist[id="class_options"]`).append(
            `<option class="class_option" data-uuid="${class_value.uuid}" value="${class_value.name}" label="${class_value.name} - world.Item">world.Item</option>`
         );
      }

      let compendiums = game.packs;

      for (const [compendium_key, compendium_value] of compendiums.entries()) {
         let classes = await compendium_value.getDocuments({ type: "class" });
         for (const [class_key, class_value] of classes.entries()) {
            let source = class_value.pack.replace(/\..*$/, "");
            html.find(`datalist[id="class_options"]`).append(
               `<option class="class_option" data-uuid="${class_value.uuid}" value="${class_value.name}" label="${class_value.name} - ${source}"></option>`
            );
         }
      }
   }

   async fill_age_options(html) {

      let age_options = game.items.filter(i => i.type == "age");

      for (const [age_key, age_value] of age_options.entries()) {

         html.find(`datalist[id="age_options"]`).append(
            `<option class="age_option" data-uuid="${age_value.uuid}" value="${age_value.name}" label="${age_value.name} - world.Item">world.Item</option>`
         );
      }

      let compendiums = game.packs;

      for (const [compendium_key, compendium_value] of compendiums.entries()) {
         let ages = await compendium_value.getDocuments({ type: "age" });
         for (const [age_key, age_value] of ages.entries()) {
            let source = age_value.pack.replace(/\..*$/, "");
            html.find(`datalist[id="age_options"]`).append(
               `<option class="age_option" data-uuid="${age_value.uuid}" value="${age_value.name}" label="${age_value.name} - ${source}"></option>`
            );
         }
      }
   }
   activateListeners(html) {
      super.activateListeners(html);

      html.ready(ev => {
         this.fill_class_options(html);
         this.fill_age_options(html);
      });

      /** Stats  */
      html.find(`img[id="system.stats.strength.value"]`).click(ev => {
         this.rollStrength(html)
      });
      html.find(`img[id="system.stats.speed.value"]`).click(ev => {
         this.rollSpeed(html)
      });
      html.find(`img[id="system.stats.mind.value"]`).click(ev => {
         this.rollMind(html)
      });
      html.find(`img[id="system.stats.heart.value"]`).click(ev => {
         this.rollHeart(html)
      });

      /**Saves */
      html.find(`img[id="system.stats.reality.value"]`).click(ev => {
         this.rollReality(html)
      });
      html.find(`img[id="system.stats.fear.value"]`).click(ev => {
         this.rollFear(html)
      });
      html.find(`img[id="system.stats.body.value"]`).click(ev => {
         this.rollBody(html)
      });

      /** Redo Skills */
      html.find(`i[id="system.class.skills.redo"]`).click(ev => {
         this.applyClassSkills(html)
      });

      /** Roll everything button */
      html.find(`div[id="roll.everything"]`).click(ev => {
         this.rollEverything(html)
      });

      /** Class input
       * when changed will lockup if its a defined class item and apply the apropiate modifiers
       *
       */
      html.find(`input[id="system.class.value"]`).change(ev => {
         let class_name = html.find(`input[id="system.class.value"]`).prop('value');
         if (class_name == "") {
            //class name is empty, no class selected.
            return;
         }
         let class_option = html.find(`option[class="class_option"][value="${class_name}"]`).prop('dataset');
         if (class_option == null) {
            //class name is not part of the option, leave the string, and dont process uuid.
            return;
         }
         //we have a valid class item to process.
         this.updateClass(class_option["uuid"]);

      });

      /** Age input
       * when changed will lookup if its a defined age item and apply the apropriate modifiers
       *
       */
      html.find(`input[id="system.other.age.value"]`).change(ev => {
         let age_name = html.find(`input[id="system.other.age.value"]`).prop('value');
         if (age_name == "") {
            //age name is empty, no age selected.
            return;
         }
         let age_option = html.find(`option[class="age_option"][value="${age_name}"]`).prop('dataset');
         if (age_option == null) {
            //age name is not part of the option, leave the string, and dont process uuid.
            return;
         }
         //we have a valid age item to process.
         this.updateAge(age_option["uuid"]);

      });


      /** Save and submit */
      html.find(`div[id="submit"]`).click(ev => {
         this.submit()
      });
   }

   /**
    * Roll on the loadout table and return item UUIDs
    * @param {string} tableUuid - UUID of the roll table
    * @returns {Array} Array of item UUIDs from the table results
    */
   async rollLoadoutTable(tableUuid) {
      if (!tableUuid || tableUuid === "") {
         console.log("No loadout table UUID provided");
         return [];
      }

      try {
         console.log("Rolling loadout table:", tableUuid);
         let table = await fromUuid(tableUuid);
         if (!table) {
            ui.notifications.warn("Could not find loadout table");
            return [];
         }

         let tableResult = await table.draw({ displayChat: true });
         let itemUuids = [];

         console.log("Table results:", tableResult.results);

         for (let result of tableResult.results) {
            console.log("Processing result:", result.type, result);

            if (result.type === 0 || result.type === "document") {
               // Type 0 is a document reference
               if (result.documentId) {
                  itemUuids.push(result.documentId);
                  console.log("Added document ID:", result.documentId);
               }
            } else if (result.type === 2 || result.type === "compendium") {
               // Type 2 is a compendium reference
               if (result.documentCollection && result.documentId) {
                  let uuid = `Compendium.${result.documentCollection}.${result.documentId}`;
                  itemUuids.push(uuid);
                  console.log("Added compendium UUID:", uuid);
               }
            } else if (result.type === 1 || result.type === "text") {
               // Type 1 is text - try to extract all UUIDs
               let textContent = result.text || result.getChatText?.() || "";
               console.log("Text content:", textContent);
               // Use matchAll to find ALL @UUID[...] patterns in the text
               let uuidMatches = textContent.matchAll(/@UUID\[([^\]]+)\]/gi);
               for (let match of uuidMatches) {
                  itemUuids.push(match[1]);
                  console.log("Added UUID from text:", match[1]);
               }
            }
         }

         console.log("Final item UUIDs:", itemUuids);
         return itemUuids;
      } catch (error) {
         console.error("Error rolling loadout table:", error);
         ui.notifications.error("Failed to roll loadout table: " + error.message);
         return [];
      }
   }

   /**
    * This method is called upon form submission after form data is validated
    * @param event {Event}       The initial triggering submission event
    * @param formData {Object}   The object of validated form data with which to update the object
    * @private
    */
   async _updateObject(event, formData) {

      let data = {
         "system.stats.strength.value": formData["system.stats.strength.value"] + (formData["system.stats.strength.bonus"] || 0),
         "system.stats.speed.value": formData["system.stats.speed.value"] + (formData["system.stats.speed.bonus"] || 0),
         "system.stats.mind.value": formData["system.stats.mind.value"] + (formData["system.stats.mind.bonus"] || 0),
         "system.stats.heart.value": formData["system.stats.heart.value"] + (formData["system.stats.heart.bonus"] || 0),
         "system.stats.reality.value": formData["system.stats.reality.value"] + (formData["system.stats.reality.bonus"] || 0),
         "system.stats.fear.value": formData["system.stats.fear.value"] + (formData["system.stats.fear.bonus"] || 0),
         "system.stats.body.value": formData["system.stats.body.value"] + (formData["system.stats.body.bonus"] || 0),
      }

      if (formData["name"]) {
         data["name"] = formData["name"];
      }
      if (formData["system.class.value"]) {
         data["system.class.value"] = formData["system.class.value"];
         data["system.class.uuid"] = formData["system.class.uuid"];
         data["system.other.stressdesc.value"] = formData["system.class.traumaresponse"];
      }
      if (formData["system.other.age.value"]) {
         data["system.other.age.value"] = formData["system.other.age.value"];
      }
      /*
      ChatMessage.create({content:`Character Rolls<br />
         STATS<br />
         Strength: ${data["system.stats.strength.value"]} = ${formData["system.stats.strength.value"]}+${formData["system.stats.strength.bonus"]}<br />
         Speed: ${data["system.stats.speed.value"]} = ${formData["system.stats.speed.value"]}+${formData["system.stats.speed.bonus"]}<br />
         Intellect: ${data["system.stats.intellect.value"]} = ${formData["system.stats.intellect.value"]}+${formData["system.stats.intellect.bonus"]}<br />
         Combat: ${data["system.stats.combat.value"]} = ${formData["system.stats.combat.value"]}+${formData["system.stats.combat.bonus"]}<br />
         SAVES<br />
         Sanity: ${data["system.stats.sanity.value"]} = ${formData["system.stats.sanity.value"]}+${formData["system.stats.sanity.bonus"]}<br />
         Fear: ${data["system.stats.fear.value"]} = ${formData["system.stats.fear.value"]}+${formData["system.stats.fear.bonus"]}<br />
         Body: ${data["system.stats.body.value"]} = ${formData["system.stats.body.value"]}+${formData["system.stats.body.bonus"]}<br />
         <br />
         Health: ${data["system.health.max"]}<br/>
         Extra wounds: ${formData["system.stats.max_wounds.bonus"]}<br/>
         Credits: ${data["system.credits.value"]}   <br />
            <br />
            Trinket roll:   <br />
            Patch roll:    <br />
            Loadout roll   <br />`});
        */

      if (formData["system.removepreviousitems"]) {
         let itemTypesToDelete = ["item", "armor", "weapon", "skill", "condition"];
         let itemsToDelete = this.object.items.filter(item => itemTypesToDelete.includes(item.type));
         await this.object.deleteEmbeddedDocuments("Item", itemsToDelete.map(item => item.id));
      }

      // Add skills from class
      if (formData["system.class.skills.uuid"]) {
         let skillsItems = formData["system.class.skills.uuid"].split(",");
         for (var i = 0; i < skillsItems.length; i++) {
            await this.object.modifyItem(skillsItems[i], 1);
         }
      }

      // Roll and add loadout items from class roll table
      if (formData["system.class.uuid"]) {
         try {
            console.log("Class UUID found:", formData["system.class.uuid"]);
            const classItem = await fromUuid(formData["system.class.uuid"]);
            console.log("Class item:", classItem);
            console.log("Class roll tables:", classItem?.system?.roll_tables);

            if (classItem && classItem.system.roll_tables && classItem.system.roll_tables.loadout) {
               console.log("Rolling loadout table:", classItem.system.roll_tables.loadout);
               const loadoutItemUuids = await this.rollLoadoutTable(classItem.system.roll_tables.loadout);

               console.log("Received loadout UUIDs:", loadoutItemUuids);

               // Add each loadout item to the character
               for (const itemUuid of loadoutItemUuids) {
                  console.log("Adding item:", itemUuid);
                  await this.object.modifyItem(itemUuid, 1);
                  console.log("Item added successfully");
               }

               if (loadoutItemUuids.length > 0) {
                  ui.notifications.info(`Added ${loadoutItemUuids.length} loadout items to character`);
               } else {
                  console.log("No loadout items to add");
               }
            } else {
               console.log("No loadout table configured for this class");
            }
         } catch (error) {
            console.error("Error adding loadout items:", error);
            ui.notifications.warn("Failed to add some loadout items: " + error.message);
         }
      } else {
         console.log("No class UUID in form data");
      }

      // Add items from age
      if (formData["system.other.age.uuid"]) {
         try {
            console.log("Age UUID found:", formData["system.other.age.uuid"]);
            const ageItem = await fromUuid(formData["system.other.age.uuid"]);
            console.log("Age item:", ageItem);

            if (ageItem && ageItem.system.base_adjustment && ageItem.system.base_adjustment.items_granted) {
               const ageItemsGranted = ageItem.system.base_adjustment.items_granted;
               console.log("Age items_granted:", ageItemsGranted);

               // Add each item from the age to the character
               for (const itemUuid of ageItemsGranted) {
                  console.log("Adding age item:", itemUuid);
                  await this.object.modifyItem(itemUuid, 1);
                  console.log("Age item added successfully");
               }

               if (ageItemsGranted.length > 0) {
                  ui.notifications.info(`Added ${ageItemsGranted.length} items from age ${ageItem.name}`);
               } else {
                  console.log("No items granted by this age");
               }
            } else {
               console.log("No items_granted configured for this age");
            }
         } catch (error) {
            console.error("Error adding age items:", error);
            ui.notifications.warn("Failed to add some age items: " + error.message);
         }
      } else {
         console.log("No age UUID in form data");
      }

      this.object.update(data);
   }

}