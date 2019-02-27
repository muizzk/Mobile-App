class CurrencyConverter {
    static convert(exchangeRates, from, to, quantity) {
        try {
            return quantity * exchangeRates[from][to];
        } catch(e) {
            //debugger;
            //@@@@
            return -1;
        }
    }
}

export {
    CurrencyConverter
};