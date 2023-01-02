const ingredients = {}
const synergies = {}


class Pot {

    constructor() {
        this.ingredients = []

        this.vigor = 0
        this.spirit = 0
        this.sophistication = 0
    }

    addIngredient( name) {
        let ingredient = ingredients[name]

        if( synergies.hasOwnProperty(name)) {

            for( let synergy of synergies[name]) {
                if( synergy.item === 'Empty' && this.ingredients.length === 0) {
                    this.applySynergy( synergy)
                } else if( synergy.item.length > 1) {
                    if( this.ingredients.indexOf( name) >= 0) {
                        this.applySynergy( synergy)
                    }
                } else if( (this.types & synergy.types) === synergy.types) {

                    this.applySynergy( synergy)
                } 
            }
        }


        this.ingredients.push( ingredient)

        this.vigor += ingredient.vigor
        this.spirit += ingredient.spirit
        this.sophistication += ingredient.soph
    }

    applySynergy( synergy) {
        this.vigor += synergy.vigorAdd
        this.vigor *= synergy.vigorMultiplier

        this.spirit += synergy.spiritAdd
        this.spirit *= synergy.spiritMultiplier

        this.sophistication += synergy.sophAdd
        this.sophistication *= synergy.sophMultiplier
    }

    get types() {
        if( this.ingredients.length === 0) return 0
        if( this.ingredients.length === 1) return this.ingredients[0].types

        return this.ingredients.reduce( (a,b) => a.types | b.types)
    }
}

function parseIngredients( data) {
    let list = data.split(/\n/)

    list.pop()

    for( let i=1; i<list.length; i++) {

        let ingredient = {}
        let properties = list[i].split(',')

        ingredient.types = parseInt( properties.slice(0,6).join(''), 2)
        ingredient.name = properties[6]

        ingredient.vigor = parseInt( properties[7])
        ingredient.spirit = parseInt( properties[8])
        ingredient.soph = parseInt( properties[9])

        let synergy = {}

        synergy.vigorMultiplier = parseInt( properties[10]) || 1
        synergy.vigorAdd = parseInt( properties[11])

        synergy.spiritMultiplier = parseInt( properties[12]) || 1
        synergy.spiritAdd = parseInt( properties[ 13])

        synergy.sophMultiplier = parseInt( properties[14]) || 1
        synergy.sophAdd = parseInt( properties[ 15])

        synergy.item = properties[16]
        synergy.types = parseInt( properties.slice(17,23).join(''), 2)

        if(! synergies.hasOwnProperty(ingredient.name)) {
            synergies[ingredient.name] = []
        }

        synergies[ingredient.name].push( synergy)

        ingredients[ingredient.name] = ingredient
    }
}


function calculatePots() {
    let names = Object.keys( ingredients)

    names = names.filter( name => ingredients[name].include === true)

    pots = []

    for(let first of names) {
        for(let second of names) {
            for(let third of names) {
                let pot = new Pot()

                pot.addIngredient(first)
                pot.addIngredient(second)
                pot.addIngredient(third)

                pots.push( pot)
            }
        }
    }
}

function loadInclusions() {
    let names = JSON.parse(localStorage.getItem('inclusions') || '[]')


    for(let name of names) {
        ingredients[name].include = true
    }
}

function storeInclusions() {

    let names = Object.keys( ingredients)

    names = names.filter( name => ingredients[name].include === true)

    localStorage.setItem('inclusions', JSON.stringify( names))
}

function init( data) {
    parseIngredients( data)


    app = Vue.createApp({
        data() {
            return {
                ingredients,
                pots,
            }
        },

        methods: {

            saveFilter() {
                storeInclusions()
            },

            toggleIngredient( name) {

                ingredients[name].include = !ingredients[name].include

                this.$forceUpdate()

                calculatePots()

            },
            vigorPots() {
                return pots.sort( (a,b) => b.vigor - a.vigor).slice(0,10)
            },
            spiritPots() {
                return pots.sort( (a,b) => b.spirit - a.spirit).slice(0,10)
            },
            sophisticationPots() {
                return pots.sort( (a,b) => b.sophistication - a.sophistication).slice(0,10)
            },

            selectAll() {
                for(let name in ingredients) {
                    ingredients[name].include = true
                }
                this.$forceUpdate()

                calculatePots()
            },

            selectNone() {
                for(let name in ingredients) {
                    ingredients[name].include = false
                }
                this.$forceUpdate()
                
                calculatePots()
            }
        },
        computed: {

        },
        mounted() {
            calculatePots()

            loadInclusions()


            this.toggleIngredient('Wood')
            this.toggleIngredient('Wood')

        }
    }).mount('#app')
}

fetch('ingredients.csv')
.then( resp => resp.text())
.then( init)


let pots = []
let app
