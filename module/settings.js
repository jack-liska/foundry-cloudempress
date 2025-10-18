import { rolltableConfig } from "./windows/settings-rolltables.js";

export const registerSettings = function () {

  game.settings.register('cloudempress', 'macroTarget', {
    name: "Macro Target",
    hint: "Who should be the target for macros?",
    default: "character",
    scope: 'world',
    type: String,
    choices: {
      "character": "Currently selected character for the player",
      "token": "Currently selected token(s) in the scene"
    },
    config: true,
    onChange: value => {
      //log the change
      console.log("Macro target set to " + value)
    }
  });

  game.settings.register('cloudempress', 'critDamage', {
    name: "Critical Hit Damage",
    hint: "What should the damage be on a critical hit?",
    default: "advantage",
    scope: 'world',
    type: String,
    choices: {
      "advantage": "Roll with advantage",
      "doubleDamage": "Double the damage result",
      "doubleDice": "Double the damage dice",
      "maxDamage": "Maximum possible damage result",
      "weaponValue": "Defer to each weapon's critical damage",
      "none": "No critical damage"
    },
    config: true,
    onChange: value => {
      //log the change
      console.log("Critical hits set to " + value)
    }
  });

  game.settings.register('cloudempress', 'damageDiceTheme', {
    name: "Damage Dice Theme",
    hint: "If DiceSoNice is installed, what theme should be applied to damage dice?",
    default: "damage",
    scope: 'world',
    type: String,
    config: true,
    onChange: value => {
      //log the change
      console.log("Damage dice theme set to " + value)
    }
  });

  game.settings.register('cloudempress', 'panicDieTheme', {
    name: "Panic Die Theme",
    hint: "If DiceSoNice is installed, what theme should be applied to the panic die?",
    default: "panic",
    scope: 'world',
    type: String,
    config: true,
    onChange: value => {
      //log the change
      console.log("Panic die theme set to " + value)
    }
  });

  game.settings.register('cloudempress', 'hideWeight', {
    name: "Hide 0e Weight",
    hint: "Hide the 0e weight mechanic in the items list for players and ships?",
    default: true,
    scope: 'world',
    type: Boolean,
    config: true,
    onChange: value => {
      //log the change
      console.log("hideWeight set to " + value)
    }
  });
  
  game.settings.register('cloudempress', 'autoStress', {
    name: "Auto Stress Gain on Failures?",
    hint: "Automatically handles stress gain on a failed roll.",
    default: true,
    scope: 'world',
    type: Boolean,
    config: true,
    onChange: value => {
      //log the change
      console.log("autoStress set to " + value)
    }
  });

  game.settings.registerMenu('cloudempress', 'rolltableSelector', {
    name: "Rolltable Configuration",
    label: "Choose Tables",
    hint: "Customize which rolltables are used.",
    icon: "fa-solid fa-list",
    type: rolltableConfig
  });

  game.settings.register('cloudempress', 'table1ePanic', {
    scope: 'world',
    config: false,
    type: String,
    default: "pMet0NEpRn6dUH5x"
  });

  game.settings.register('cloudempress', 'table1eWound', {
    scope: 'world',
    config: false,
    type: String,
    default: "yif3X47YSyufnizF"
  });

  game.settings.register('cloudempress', 'table1eDeath', {
    scope: 'world',
    config: false,
    type: String,
    default: "kW2lQ6itmPIFhQne"
  });

  game.settings.register('cloudempress', 'table1eMiscast', {
    scope: 'world',
    config: false,
    type: String,
    default: "FkujMk5YgL96SJfZ"
  });

  game.settings.register('cloudempress', 'table1eCurse', {
    scope: 'world',
    config: false,
    type: String,
    default: "s1CjtWxrNdpm2PXy"
  });

};