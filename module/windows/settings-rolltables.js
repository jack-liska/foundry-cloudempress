export class rolltableConfig extends FormApplication {
    static get defaultOptions() {
        const options = super.defaultOptions;
        console.log(options);
        //options.id = 'sheet-modifiers';
        //options.classes = ["mosh", "sheet", "actor", "ship"];
        options.id = 'rolltable-modifiers';
        options.classes = ["mosh"];
        options.template = 'systems/cloudempress/templates/dialogs/settings-rolltableconfig-dialog.html';
        options.width = 800;
        options.height = 'auto';
        options.resizeable = false;
        options.submitOnChange = true;
        options.submitOnClose = true;
        options.closeOnSubmit = false;
        return options;
    }

    /**
     * Construct and return the data object used to render the HTML template for this form application.
     * @return {Object}
     */
    getData() {
        const tableSelection = super.getData();
        tableSelection.table1ePanic = game.settings.get("cloudempress", "table1ePanic");
        tableSelection.table1eWound = game.settings.get("cloudempress", "table1eWound");
        tableSelection.table1eDeath = game.settings.get("cloudempress", "table1eDeath");
        tableSelection.table1eMiscast = game.settings.get("cloudempress", "table1eMiscast");
        tableSelection.table1eCurse = game.settings.get("cloudempress", "table1eCurse");

        return tableSelection;
    }
    /* -------------------------------------------- */

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);

        // Close Button
        html.find('.close-button').click(ev => {
            this.close()
        });
    }

    /**
     * This method is called upon form submission after form data is validated
     * @param event {Event}       The initial triggering submission event
     * @param formData {Object}   The object of validated form data with which to update the object
     * @private
     */
    async _updateObject(event, formData) {
        await Promise.all([
            game.settings.set("cloudempress", "table1ePanic", formData["table1ePanic"]),
            game.settings.set("cloudempress", "table1eWound", formData["table1eWound"]),
            game.settings.set("cloudempress", "table1eDeath", formData["table1eDeath"]),
            game.settings.set("cloudempress", "table1eMiscast", formData["table1eMiscast"]),
            game.settings.set("cloudempress", "table1eCurse", formData["table1eCurse"])
        ]);

    }
}
