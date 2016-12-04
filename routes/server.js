var math = require('./math');

module.exports = function(text){
    var data = text.split('\n');
    var header = data[0].split(',');

    data = data.slice(1, data.length);
    for (var i = 0; i < data.length; ++i) {
        data[i] = data[i].split(',').map(Number);
    }
    data = math.Transpose(data);

    var number_ = data[0];
    var week_ = data[1];
    var sale = data[2].slice(0, 200);
    var price = data[3].slice(0, 200);
    var number = number_.slice(0, 200);
    var week = week_.slice(0, 200);

    var page2 = initPage2(number, number_, price);
    var page3 = initPage3(number, week, sale);
    var page4 = initPage4(number, week, sale, page3.trend);
    var page5 = initPage5(week.slice(52, week.length), sale.slice(52, sale.length), price.slice(52, price.length));
    var page6 = initPage6(week.slice(52, week.length), sale.slice(52, sale.length), page3.seasonality.slice(52, week.length), 
                            page4.trend_influence.slice(52, week.length), page5.price_influence);

    var result = {
        table1: [header, math.Transpose([number,week,sale,price])],
        table2: page2.table2,
        table2_1: page2.table2_1,
        table3: page3.table3,
        table3_1: page3.table3_1,
        table4: page4.table4,
        table5: page5.table5,
        table5_1: page5.table5_1,
        table6: page6.table6,
        table6_1: page6.table6_1,
        chart2: page2.chart2, 
        chart3: page3.chart3, 
        chart4: page4.chart4, 
        chart5: page5.chart5, 
        chart6: page6.chart6
    }

    return result;
}

/** Calculating data for the second page */
function initPage2(number, number_, price) {
    var X = math.Transpose([Array.apply(null, Array(number.length)).map(Number.prototype.valueOf, 1), number]);
    var koef = math.LS(price, X);
    var trend = [];
    for (var i = 0; i < number_.length; ++i) {
        trend[i] = +(koef[0] + koef[1] * number_[i]).toFixed(5);
    }

    koef.forEach(function (item, i, arr) {
        arr[i] = +item.toFixed(7);
    });

    koef.unshift("y = a*x + b");

    var result = {
        table2: [["№", "Средняя цена", "Тренд"], math.Transpose([number_, price, trend])],
        table2_1: [["Коеф. тренда", "b", "a"], math.Transpose(koef)],
        chart2: { x: number_, y: [trend, price], name: "Тренд"+ ";" + "Средняя цена"}
    }
    return result;
}

/** Calculating data for the third page */
function initPage3(number, week, sale) {
    var average = Array.apply(null, Array(sale.length));
    var growth = Array.apply(null, Array(sale.length));
    for (var i = 26; i < sale.length - 26; ++i) {
        var sale_ = sale.slice(i - 26, i + 26);
        sale_[0] = (sale[i - 26] + sale[i + 26]) / 2;
        average[i] = +math.Mean(sale_).toFixed(5);
        growth[i] = +(sale[i] - average[i]).toFixed(5);
    }

    var seasonality = Array.apply(null, Array(sale.length));
    for (var i = 0; i < 52; ++i) {
        var sum = 0;
        var n = 0;
        for (var j = i; j < growth.length; j += 52) {
            if (growth[j]) {
                sum += growth[j];
                ++n;
            }
        }
        seasonality[i] = +(sum / n).toFixed(5);
    }

    for (var i = 0; i < 52; ++i) {
        for (var j = i + 52; j < growth.length; j += 52) {
            seasonality[j] = +seasonality[i].toFixed(5);
        }
    }

    var sale_clean = [];
    for (var i = 0; i < sale.length; ++i) {
        sale_clean[i] = (sale[i] - seasonality[i]) > 0 ? +(sale[i] - seasonality[i]).toFixed(5) : 0;
    }

    var X = math.Transpose([Array.apply(null, Array(number.length)).map(Number.prototype.valueOf, 1), number]);
    var koef = math.LS(sale_clean, X);
    var trend = [];
    for (var i = 0; i < number.length; ++i) {
        trend[i] = +(koef[0] + koef[1] * number[i]).toFixed(5);
    }

    koef.forEach(function (item, i, arr) {
        arr[i] = +item.toFixed(7);
    });

    koef.unshift("y = a*x + b");

    var result = {
        table3: [["№", "Неделя", "Продажи", "Сезонный прирост усредненный", "Продажи очищенные от сезонности", "Тренд"], 
                    math.Transpose([number, week, sale, seasonality, sale_clean, trend])],
        table3_1: [["Коеф. тренда", "b", "a"], math.Transpose(koef)],
        chart3: {x: number, y: [trend, sale, sale_clean, seasonality], 
            name: "Тренд" + ";" + "Продажи" + ";" + "Продажи очищенные от сезонности" + ";" + "Сезонный прирост усредненный"},
        trend: trend,
        seasonality: seasonality
    }
    return result;
}

/** Calculating data for the fourth page */
function initPage4(number, week, sale, trend) {
    var trend_influence = [];
    var sale_mean = math.Mean(sale);

    for (var i = 0; i < trend.length; ++i) {
        trend_influence[i] = +(trend[i] - sale_mean).toFixed(5);
    }

    var result = {
        table4: [["N", "Неделя", "Продажи", "Влияние тренда", "Ср.знач. продаж"], 
                    math.Transpose([number, week, sale, trend_influence, [sale_mean]])],
        chart4: {x: number, y: [trend, trend_influence, sale], name:"Тренд" + ";" + "Влияние тренда" + ";" + "Продажи"},
        trend_influence: trend_influence
    }

    return result;
}

/** Calculating data for the fifth page */
function initPage5(week, sale, price) {
    var price_ln = [];
    var sale_ln = [];
    for (var i = 0; i < price.length; ++i) {
        price_ln[i] = Math.log(price[i]);
        sale_ln[i] = Math.log(sale[i]);
    }
    var X = math.Transpose([Array.apply(null, Array(week.length)).map(Number.prototype.valueOf, 1), price]);
    var X_ln = math.Transpose([Array.apply(null, Array(week.length)).map(Number.prototype.valueOf, 1), price_ln]);
    var koef1 = math.LS(sale, X);
    var koef2 = math.LS(sale_ln, X);
    var koef3 = math.LS(sale, X_ln);
    var regr1 = [];
    var regr2 = [];
    var regr3 = [];
    for (var i = 0; i < week.length; ++i) {
        regr1[i] = +(koef1[0] + koef1[1] * price[i]).toFixed(5);
        regr2[i] = +(Math.exp(koef2[0] + koef2[1] * price[i])).toFixed(5);
        regr3[i] = +(koef3[0] + koef3[1] * price_ln[i]).toFixed(5);
    }

    var RMSE1 = +math.RMSE(sale, regr1).toFixed(5);
    var RMSE2 = +math.RMSE(sale, regr2).toFixed(5);
    var RMSE3 = +math.RMSE(sale, regr3).toFixed(5);

    koef1.forEach(function (item, i, arr) {
        arr[i] = +item.toFixed(7);
    });
    koef2.forEach(function (item, i, arr) {
        arr[i] = +item.toFixed(7);
    });
    koef3.forEach(function (item, i, arr) {
        arr[i] = +item.toFixed(7);
    });

    koef1.unshift("y = a*x + b");
    koef2.unshift("y = exp(a*x + b)");
    koef3.unshift("y = a*lnx + b");
    koef1.push(RMSE1);
    koef2.push(RMSE2);
    koef3.push(RMSE3);

    var price_influence;
    if ((RMSE1 > RMSE2) && (RMSE1 > RMSE3))
    {
        price_influence = regr1;
    } else{
        if ((RMSE2 > RMSE1) && (RMSE2 > RMSE3))
        {
            price_influence = regr2;
        } else{
            price_influence = regr3;
        }
    }

    var _regr1 = [], _regr2 = [], _regr3 = [], _price = [];
    for (var i = 0; i < price.length; ++i) {
        _price[i] = price[i];
    }
    for(var i = 0; i < _price.length; ++i) {
        var min = _price[i];
        var index = i;
        for (var j = i + 1; j < _price.length; ++j) {
            if (min > _price[j]) {
                index = j;
                min = _price[j];
            }
        }
        var temp = _price[i];
        _price[i] = _price[index];
        _price[index] = temp;
        _regr1[i] = regr1[index];
        _regr2[i] = regr2[index];
        _regr3[i] = regr3[index];
    }

    var result = {
        table5: [["Неделя", "Средняя цена", "Продажи", "Линейная регр.", "Экспоненц. регр.", "Логарифм. регр."], 
                    math.Transpose([week, price, sale, regr1, regr2, regr3])],
        table5_1: [["Коеф. тренда", "b", "a", "RMSE"], [koef1, koef2, koef3]],
        chart5: {x: _price, y: [_regr1, _regr2, _regr3], 
            name: "Линейная регр." + ";" + "Экспоненц. регр." + ";" + "Логарифм. регр."},
        price_influence: price_influence
    }

    return result;
}

/** Calculating data for the sixth page */
function initPage6(week, sale, seasonality, trend_influence, price_influence) {
    var sale_mean = math.Mean(sale);
    var X1 = math.Transpose([Array.apply(null, Array(week.length)).map(Number.prototype.valueOf, sale_mean), seasonality, trend_influence]);
    var X2 = math.Transpose([Array.apply(null, Array(week.length)).map(Number.prototype.valueOf, sale_mean), seasonality, price_influence]);
    var koef1 = math.LS(sale, X1);
    var koef2 = math.LS(sale, X2);
    var regr1 = [];
    var regr2 = [];
    for (var i = 0; i < week.length; ++i) {
        regr1[i] = +(koef1[0] * sale_mean + koef1[1] * seasonality[i] + koef1[2] * trend_influence[i]).toFixed(5);
        regr2[i] = +(koef2[0] * sale_mean + koef2[1] * seasonality[i] + koef2[2] * price_influence[i]).toFixed(5);
    }

    var RMSE1 = +math.RMSE(sale, regr1).toFixed(5);
    var RMSE2 = +math.RMSE(sale, regr2).toFixed(5);

    koef1.forEach(function (item, i, arr) {
        arr[i] = +item.toFixed(7);
    });
    koef2.forEach(function (item, i, arr) {
        arr[i] = +item.toFixed(7);
    });

    koef1.unshift("y = b1*сред.продаж + b2*сезонн. + b3*вл.тренда");
    koef2.unshift("y = b1*сред.продаж + b2*сезонн. + b3*вл.цены");
    koef1.push(RMSE1);
    koef2.push(RMSE2);

    var result = {
        table6: [["Неделя", "Продажи", "Множ. регрессия (влияние тренда)", "Множ. регрессия (влияние цены)"], 
                     math.Transpose([week, sale, regr1, regr2])],
        table6_1: [["Коеф. множ. регр.", "b1", "b2", "b3", "RMSE"], [koef1, koef2]],
        chart6: {x: week, y: [sale,regr1,regr2], 
            name: "Продажи" + ";" + "Множ. регрессия (влияние тренда)" + ";" + "Множ. регрессия (влияние цены)"}
    }

    return result;
}