/** Least square method */
var LS = function(y, X) {
    if (y.length != X.length) {
        return [];
    }
    return Mult(Invert(Mult(Transpose(X), X)), Mult(Transpose(X), y));
}

/** Transposition of matrices */
var Transpose = function(X) {

    var X_transp = [];
    var rows = X.length ? X.length : 0;
    var cols = X[0] instanceof Array ? X[0].length : 1;

    if (cols == 0 || rows == 0) {
        return [];
    }

    for (var i = 0; i < cols; ++i) {
        if (rows == 1) {
            X_transp[i] = X[0][i];
        } else {
            X_transp[i] = [];

            for (var j = 0; j < rows; ++j) {
                if (cols == 1) {
                    X_transp[i][j] = X[j];
                } else {
                    X_transp[i][j] = X[j][i];
                }
            }
        }
    }

    return X_transp;
}

/** Matrix multiplication */
var Mult = function(A, B) {

    var rows_A = A.length ? A.length : 0;
    var rows_B = B.length ? B.length : 0;
    var cols_A = A[0] instanceof Array ? A[0].length : 1;
    var cols_B = B[0] instanceof Array ? B[0].length : 1;

    if (cols_A != rows_B) {
        return [];
    }

    var result = new Array(rows_A);
    for (var i = 0; i < rows_A; ++i) {
        if (cols_B == 1) {
            result[i] = 0;
            for (var k = 0; k < cols_A; ++k) {
                result[i] += A[i][k] * B[k];
            }
        } else {
            result[i] = new Array(cols_B);
            for (var j = 0; j < cols_B; ++j) {
                result[i][j] = 0;
                for (var k = 0; k < cols_A; ++k) {
                    result[i][j] += A[i][k] * B[k][j];
                }
            }
        }
    }
    return result;
}

/** Finding the inverse matrix */
var Invert = function(X) {

    if (X.length !== X[0].length) { return []; }

    var i = 0, ii = 0, j = 0, dim = X.length, e = 0, t = 0;
    var I = [], C = [];
    for (i = 0; i < dim; i += 1) {
        I[I.length] = [];
        C[C.length] = [];
        for (j = 0; j < dim; j += 1) {

            if (i == j) { I[i][j] = 1; }
            else { I[i][j] = 0; }
            C[i][j] = X[i][j];
        }
    }

    for (i = 0; i < dim; i += 1) {
        e = C[i][i];
        if (e == 0) {
            for (ii = i + 1; ii < dim; ii += 1) {
                if (C[ii][i] != 0) {
                    for (j = 0; j < dim; j++) {
                        e = C[i][j];
                        C[i][j] = C[ii][j];
                        C[ii][j] = e;
                        e = I[i][j];
                        I[i][j] = I[ii][j];
                        I[ii][j] = e;
                    }
                    break;
                }
            }
            e = C[i][i];
            if (e == 0) { return }
        }
        for (j = 0; j < dim; j++) {
            C[i][j] = C[i][j] / e;
            I[i][j] = I[i][j] / e;
        }
        for (ii = 0; ii < dim; ii++) {
            if (ii == i) { continue; }
            e = C[ii][i];
            for (j = 0; j < dim; j++) {
                C[ii][j] -= e * C[i][j];
                I[ii][j] -= e * I[i][j];
            }
        }
    }
    return I;
}

/** Calculation of the mean square error */
var RMSE = function(y, pred) {
    if ((y.length != pred.length) || (y.length == 0)) {
        return null;
    }
    var rmse = 0;
    for (var i = 0; i < y.length; ++i) {
        rmse += Math.pow(y[i] - pred[i], 2);
    }
    rmse = Math.sqrt(rmse / y.length);
    return rmse;
}

/** The average value of the vector */
var Mean = function(x) {
    if (x.length == 0) {
        return null;
    }
    var mean = 0;
    for (var i = 0; i < x.length; ++i) {
        mean += x[i];
    }
    mean /= x.length;
    return mean;
}

var functions = {
    LS: LS,
    Transpose: Transpose,
    Mult: Mult,
    Invert: Invert,
    RMSE: RMSE,
    Mean: Mean
}

module.exports = functions;