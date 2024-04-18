const operators = {
    LT: { simbol: '<', literal: 'Smaller Than'},
    LE: { simbol: '<=', literal: 'Less Than Equal'},
    GT: { simbol: '>', literal: 'Greater Than'},
    GE: { simbol: '>=', literal: 'Greater Than Equal'},
    EQ: { simbol: '==', literal: 'Same As'}
}

/**
 * Rule to be evaluated
 */
class Rule {
    constructor(fact, operator, value) {
        this.fact = fact;
        this.operator = opeartor;
        this.value = value
    }
}

rules = [
    new Rule()
]



console.log(operators.LT);