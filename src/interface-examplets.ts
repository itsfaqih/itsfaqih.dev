type Formula = (a: number, b: number) => number

class Calculator {
	do: Record<string, Formula> = {
		sum: (a, b) => {
			return a + b;
		}
	}

	public addFormula(name: string, newFormula: Formula) {
		this.do[name] = newFormula;
	}
}

const calculator = new Calculator()

console.log(calculator.do.sum(1, 2))

calculator.addFormula('minus', (a, b) => a - b);

console.log(calculator.do.minus(2, 1))
