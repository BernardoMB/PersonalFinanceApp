// El tema de bases de datos será manejado a traves de Andrew Mead.
// TODO: Ya no manejar arrays de categorias, hacaer lo todo con los arrays d elas entradas.

incomeColors = [
    '#0072BB',
    '#FF4C3B',
    '#FFD034',
    '#CC6666',
    '#663333',
    '#ee965c'
];

expenseColors = [
    '#6F3662',
    '#FF7182',
    '#FFAE5D',
    '#F8DEBD',
    '#9F6164',
    '#EB6E44'
];

angular.module('PFApp', ['ngMaterial', 'md.data.table']).run(function($log) {
    $log.debug("Personal Fiance App is ready!");
});

angular.module('PFApp').controller('ExpenseAppCont', ['$scope', '$mdDialog', '$mdMedia', '$log', '$mdEditDialog', '$q', '$timeout', function($scope, $mdDialog, $mdMedia, $log, $mdEditDialog, $timeout) {
    
    // App's code.

    // Globales /*
    $scope.id = 0;
    $scope.isIncome = {
        bool: null
    }

    // Income.
    $scope.incomeEntries = {
        incomeEntriesArray: []
    }
    $scope.incomeCategories = {
        incomeCategoriesArray: []
    }
    
    // Expense.
    $scope.entries = {
        entriesArray: []
    }
    $scope.categories = {
        categoriesArray: []
    }
    
    // General.
    $scope.IEentries = {
        IEentriesArray: []
    }

    // Balance.
    $scope.superavit = {
        bool: null
    }
    $scope.balance;
    
    // Errors.
    $scope.errorNumber = {
        value: null
    }
    $scope.errorMessage = {
        errorString: ''
    }
    
    // Graficas.
    // En estas variables se guardan objetos de la clase Chart (chartJS).
    // Necesario para arreglar el problema del hover de las graficas.
    $scope.chartA;
    $scope.chartB;
    $scope.chartC;
    // Globales */

    // Necesario para arreglar el problema del hover de las graficas.
    var graphsChanged = false;

    // Grafica la informacion al corriente de los arrays anteriores.
    $scope.graphMain = function() {
        
        // Necesario para arreglar el problema del hover de las graficas.
        if (graphsChanged) {
            $scope.chartA.destroy();
            $scope.chartB.destroy();
            $scope.chartC.destroy();
        }

        // Income /*
        // Prepare income chart info.
        var incomeChartLabels = [];
        var incomeChartValues = [];
        var incomeChartBackgroundColors = [];
        var incomeChartHoverBackgroundColors = [];
        // Populate the income arrays with the information stored in the global variables.
        // Labels:
        for (var icat in $scope.incomeCategories.incomeCategoriesArray) {
            incomeChartLabels.push($scope.incomeCategories.incomeCategoriesArray[icat]);
        }
        // Values:
        for (var icat1 in $scope.incomeCategories.incomeCategoriesArray) {
            var sumOfAmounts = 0;
            for (var ientry in $scope.incomeEntries.incomeEntriesArray) {
                if ($scope.incomeEntries.incomeEntriesArray[ientry].category === $scope.incomeCategories.incomeCategoriesArray[icat1]) {
                    sumOfAmounts = +sumOfAmounts + +$scope.incomeEntries.incomeEntriesArray[ientry].amount;
                }
            }
            incomeChartValues.push(sumOfAmounts);
        }
        // Colors and hover colors:
        for (var icat2 in $scope.incomeCategories.incomeCategoriesArray) {
            incomeChartBackgroundColors.push(incomeColors[$scope.incomeCategories.incomeCategoriesArray.indexOf($scope.incomeCategories.incomeCategoriesArray[icat2])]);
            incomeChartHoverBackgroundColors.push(incomeColors[$scope.incomeCategories.incomeCategoriesArray.indexOf($scope.incomeCategories.incomeCategoriesArray[icat2])]);
        }
        // Income chart code.
        var ictx = document.getElementById("incomeChartAllTime").getContext("2d");
        var incomeData = {
            labels: incomeChartLabels,
            datasets: [{
                data: incomeChartValues,
                backgroundColor: incomeChartBackgroundColors
                    /*,
                                    hoverBackgroundColor: incomeChartHoverBackgroundColors*/
            }]
        };
        $scope.chartA = new Chart(ictx, {
            type: 'pie',
            data: incomeData,
            options: {
                cutoutPercentage: 0
            },
            responsive: false,
            // Boolean - whether to maintain the starting aspect ratio or not when responsive, if set to
            maintainAspectRatio: false
        });
        // Income */

        // Expenses /*
        // Prepare chart info.
        var chartLabels = [];
        var chartValues = [];
        var chartBackgroundColors = [];
        var chartHoverBackgroundColors = [];
        // Populate the expense arrays with the information stored in the global variables.
        // Labels:
        for (var cat in $scope.categories.categoriesArray) {
            chartLabels.push($scope.categories.categoriesArray[cat]);
        }
        // Values:
        for (var cat1 in $scope.categories.categoriesArray) {
            var sumOfAmounts = 0;
            for (var entry in $scope.entries.entriesArray) {
                if ($scope.entries.entriesArray[entry].category === $scope.categories.categoriesArray[cat1]) {
                    sumOfAmounts = +sumOfAmounts + +$scope.entries.entriesArray[entry].amount;
                }
            }
            chartValues.push(sumOfAmounts);
        }
        // Colors and hover colors:
        for (var cat2 in $scope.categories.categoriesArray) {
            chartBackgroundColors.push(expenseColors[$scope.categories.categoriesArray.indexOf($scope.categories.categoriesArray[cat2])]);
            chartHoverBackgroundColors.push(expenseColors[$scope.categories.categoriesArray.indexOf($scope.categories.categoriesArray[cat2])]);
        }
        // Expense chart code
        var ctx = document.getElementById("expenseChartAllTime").getContext("2d");
        var data = {
            labels: chartLabels,
            datasets: [{
                data: chartValues,
                backgroundColor: chartBackgroundColors
                    /*,
                                    hoverBackgroundColor: chartHoverBackgroundColors*/
            }]
        };
        $scope.chartB = new Chart(ctx, {
            type: 'pie',
            data: data,
            options: {
                cutoutPercentage: 0
            },
            responsive: false,
            // Boolean - whether to maintain the starting aspect ratio or not when responsive, if set to
            maintainAspectRatio: false
        });
        // Expenses */

        // Income Vs Expense /*        
        // Prepare chart info for income vs expenses.
        var chartLabelsIvsE = ['Income', 'Expense'];
        var chartValuesIvsE = [];
        var chartBackgroundColorsIvsE = ['#58d68d', '#EC7063'];
        var chartHoverBackgorundColorsIvsE = ['#58d68d', '#EC7063'];
        // Populate the values array with the infomation stored in the global variables.
        // Values:
        // Income.
        var totalIncome = 0;
        for (var entryI in $scope.incomeEntries.incomeEntriesArray) {
            totalIncome = +totalIncome + +$scope.incomeEntries.incomeEntriesArray[entryI].amount;
        }
        chartValuesIvsE.push(totalIncome);
        // Expense.
        var totalExpense = 0;
        for (var entry in $scope.entries.entriesArray) {
            totalExpense = +totalExpense + +$scope.entries.entriesArray[entry].amount;
        }
        chartValuesIvsE.push(totalExpense);
        // Balance.
        $scope.balance = +totalIncome - +totalExpense;
        if (+$scope.balance >= 0) {
            $scope.superavit.bool = true;
        }
        // Create the income vs expense pie chart.
        var ctx = document.getElementById("incomeVsExpenseAllTime").getContext("2d");
        var dataIvsE = {
            labels: chartLabelsIvsE,
            datasets: [{
                data: chartValuesIvsE,
                backgroundColor: chartHoverBackgorundColorsIvsE
                    /*,
                                    hoverBackgroundColor: chartHoverBackgroundColors*/
            }]
        };
        $scope.chartC = new Chart(ctx, {
            type: 'pie',
            data: dataIvsE,
            options: {
                cutoutPercentage: 0
            },
            responsive: false,
            // Boolean - whether to maintain the starting aspect ratio or not when responsive, if set to
            maintainAspectRatio: false
        });
        // Income Vs Expense */

        // Cambiaron las graficas, entonces
        graphsChanged = true;
    }

    // Angular material code.
    $scope.op = '';
    $scope.openNewEntryMdDialog = function(isIncome) {
        if (isIncome) {
            $scope.isIncome.bool = true;
        } else {
            $scope.isIncome.bool = false;
        }
        $scope.showNewEntryMdDialog();
    }
    $scope.showNewEntryMdDialog = function() {
        if ($scope.isIncome.bool) {
            $scope.op = 'income';
        } else {
            $scope.op = 'expense';
        }
        $mdDialog.show({
            controller: 'newEntryCont',
            bindToController: true,
            templateUrl: 'newEntryMdDialog.html',
            scope: $scope,
            preserveScope: true,
            clickOutsideToClose: true,
            skipHide: true,
            autoWrap: false
        });
    };

    
    // Fake data /*
    // Icome:
    // Income entries.
    var incomeEntriesFake = [
        {
        id: 0,
        amount: "5000",
        category: "Morpheus",
        comment: "Mapa y linea del tiempo",
        date: 1470714982.006,
        indispensable: null,
        type: "Income"
    }, {
        id: 1,
        amount: "2000",
        category: "Scribes",
        comment: "Gringas",
        date: 1470714982.007,
        indispensable: null,
        type: "Income"
    }, {
        id: 2,
        amount: "2000",
        category: "Faenas",
        comment: "Favor a Luis",
        date: 1470714982.008,
        indispensable: null,
        type: "Income"
    }];
    // Income categories.
    var incomeCategoriesFake = ["Morpheus", "Scribes", "Faenas"];
    // Expense:
    // Expense entries.
    var expenseEntriesFake = [
        {
        id: 3,
        amount: "2000",
        category: "Comida",
        comment: "",
        date: 1470714982.009,
        indispensable: null,
        type: "Expense"
    }, {
        id: 4,
        amount: "2000",
        category: "Coche",
        comment: "Refacciones",
        date: 1470714982.010,
        indispensable: null,
        type: "Expense"
    }, {
        id: 5,
        amount: "1000",
        category: "Gasolina",
        comment: "",
        date: 1470714982.011,
        indispensable: null,
        type: "Expense"
    }, {
        id: 6,
        amount: "2000",
        category: "Diversion",
        comment: "Con amigos",
        date: 1470714982.012,
        indispensable: null,
        type: "Expense"
    }, {
        id: 7,
        amount: "1000",
        category: "Fer",
        comment: "Salidas",
        date: 1470714982.013,
        indispensable: null,
        type: "Expense"
    }, {
        id: 8,
        amount: "3500",
        category: "Casa",
        comment: "Renta",
        date: 1470714982.014,
        indispensable: null,
        type: "Expense"
    }];
    // Expense categories.
    var expenseCategoriesFake = ["Comida", "Coche", "Gasolina", "Diversion", "Fer", "Casa"];
    // Income and expense:
    $scope.generalFake = [];
    for (var i in incomeEntriesFake) {
        $scope.generalFake.push(incomeEntriesFake[i]);
    }
    for (var e in expenseEntriesFake) {
        $scope.generalFake.push(expenseEntriesFake[e]);
    }
    // Income.
    $scope.incomeEntries.incomeEntriesArray = incomeEntriesFake;
    $scope.incomeCategories.incomeCategoriesArray = incomeCategoriesFake;
    // Expense.
    $scope.entries.entriesArray = expenseEntriesFake;
    $scope.categories.categoriesArray = expenseCategoriesFake;
    // General.
    $scope.IEentries.IEentriesArray = $scope.generalFake;
    $scope.id = $scope.id + $scope.incomeCategories.incomeCategoriesArray.length + $scope.entries.entriesArray.length;
    // Fake data */

    
    // Código de la tabla /*
    
    $scope.selected = [];
    $scope.deleteSelectedEntries = function() {
        for (var a in $scope.selected) {
            for (var b in $scope.IEentries.IEentriesArray) {
                if ($scope.selected[a].id === $scope.IEentries.IEentriesArray[b].id) {
                    var index = $scope.IEentries.IEentriesArray.indexOf($scope.IEentries.IEentriesArray[b]);
                    $scope.IEentries.IEentriesArray.splice(index, 1);
                    if ($scope.selected[a].type === 'Income') {
                        var indexOfIncomeEntry = $scope.incomeEntries.incomeEntriesArray.indexOf($scope.selected[a]);
                        console.log(indexOfIncomeEntry);
                        $scope.incomeEntries.incomeEntriesArray.splice(indexOfIncomeEntry, 1);
                    } else if ($scope.selected[a].type === 'Expense') {
                        var indexOfExpenseEntry = $scope.entries.entriesArray.indexOf($scope.selected[a]);
                        console.log(indexOfExpenseEntry);
                        $scope.entries.entriesArray.splice(indexOfExpenseEntry, 1);
                    }   
                }
            }
            if ($scope.selected[a].type === 'Income') {
                var incomeEntriesLeft = [];
                for (var x in $scope.incomeEntries.incomeEntriesArray) {
                    if ($scope.selected[a].category === $scope.incomeEntries.incomeEntriesArray[b]) {
                        incomeEntriesLeft.push($scope.incomeEntries.incomeEntriesArray[b]);
                    }
                }
                if (incomeEntriesLeft.length === 0) {
                    var indexOfDisposalIncomeCat = $scope.incomeCategories.incomeCategoriesArray.indexOf($scope.selected[a].category);
                    $scope.incomeCategories.incomeCategoriesArray.splice(indexOfDisposalIncomeCat, 1);
                }
            } else if ($scope.selected[a].type === 'Expense') {
                var expenseEntriesLeft = [];
                for (var x in $scope.entries.entriesArray) {
                    if ($scope.selected[a].category === $scope.entries.entriesArray[b]) {
                        expenseEntriesLeft.push($scope.entries.entriesArray[b]);
                    }
                }
                if (expenseEntriesLeft.length === 0) {
                    var indexOfDisposalExpenseCat = $scope.categories.categoriesArray.indexOf($scope.selected[a].category);
                    $scope.categories.categoriesArray.splice(indexOfDisposalExpenseCat, 1);
                }
            }
        }
        $scope.selected = [];
        $scope.graphMain();
    }
    
    // Creo que no tiene razon de ser.
    // TODO ver quien o que llama esta funcion.
    $scope.nada = function() {

    }

    'use strict';
    $scope.limitOptions = [5, 10, 15];
    $scope.options = {
        rowSelection: true,
        multiSelect: true,
        autoSelect: true,
        decapitate: false,
        largeEditDialog: false,
        boundaryLinks: false,
        limitSelect: true,
        pageSelect: true
    };
    $scope.query = {
        order: 'date',
        limit: 5,
        page: 1
    };
    $scope.toggleLimitOptions = function() {
        $scope.limitOptions = $scope.limitOptions ? undefined : [5, 10, 15];
    };

    $scope.getTypes = function() {
        return ['Income', 'Expense'];
    };
    $scope.getCategories = function(type) {
        var arrayM = [];
        for (var a in $scope.IEentries.IEentriesArray) {
            if ($scope.IEentries.IEentriesArray[a].type === type || arrayM.indexOf($scope.IEentries.IEentriesArray[a].category) === -1) {
                arrayM.push($scope.IEentries.IEentriesArray[a].category);
            }
        }
        return arrayM;
    }

    /*$scope.loadStuff = function() {
        $scope.promise = $timeout(function() {
            // loading
        }, 2000);
    }*/
    $scope.logItem = function(item) {
        console.log(item, 'was selected');
    };
    $scope.logOrder = function(order) {
        console.log('order: ', order);
    };
    $scope.logPagination = function(page, limit) {
        console.log('page: ', page);
        console.log('limit: ', limit);
    }

    // Edicion de valores de la tabla /*
    $scope.tableTypeHandleChange = function() {
        console.log($scope.IEentries.IEentriesArray);
    }
    $scope.tableCategoryHandleChange = function() {
        console.log($scope.IEentries.IEentriesArray);
    }
    $scope.tableEditEntryComment = function(event, entry) {
        event.stopPropagation(); // in case autoselect is enabled

        var editDialog = {
            modelValue: entry.comment,
            placeholder: 'Add a comment',
            save: function(input) {
                if (input.$modelValue === 'Krocs') {
                    input.$invalid = true;
                    return $q.reject();
                }
                if (input.$modelValue === 'Weed' || input.$modelValue === 'Mariguanna') {
                    return entry.comment = '420 BLAZE IT!'
                }
                entry.comment = input.$modelValue;
            },
            targetEvent: event,
            title: 'Add a comment',
            validators: {
                'md-maxlength': 30
            }
        };

        var promise;

        if ($scope.options.largeEditDialog) {
            promise = $mdEditDialog.large(editDialog);
        } else {
            promise = $mdEditDialog.small(editDialog);
        }

        promise.then(function(ctrl) {
            var input = ctrl.getInput();

            input.$viewChangeListeners.push(function() {
                input.$setValidity('test', input.$modelValue !== 'test');
            });
        });
        console.log($scope.IEentries.IEentriesArray);
    };
    // Edicion de valores de la tabla */
    
    // Código de la tabla */

}]);

// NEW ENTRY md Dialog controller.
angular.module('PFApp').controller('newEntryCont', ['$scope', '$mdDialog', function($scope, $mdDialog) {

    $scope.tipoDeOp = $scope.op;

    // Temporales /*
    $scope.amount = {
        value: null
    }
    $scope.entryDate = {
            date: null
        }
    // Temporales */
    
    $scope.entryDate.date = new Date();

    $scope.openToExistingCategoryMdDialog = function() {
        if ($scope.amount.value !== null) {
            if ($scope.amount.value != 0) {
                console.log($scope.amount.value);

                if ($scope.isIncome.bool) {
                    if ($scope.incomeCategories.incomeCategoriesArray.length !== 0) {
                        $mdDialog.show({
                            controller: 'toExistingMdDialogCont',
                            templateUrl: 'toExistingCatMdDialog.html',
                            scope: $scope,
                            preserveScope: true,
                            clickOutsideToClose: true,
                            autoWrap: true,
                            skipHide: true
                        });
                    } else {
                        //alert('There are no exiting income categories. Please select Add to new category.');
                        $scope.errorNumber.value = 420;
                        $scope.errorMessage.errorString = 'There are no exiting income categories. Please select Add to new category.';
                        $mdDialog.show({
                            controller: 'errorMdDialogCont',
                            templateUrl: 'errorMdDialog.html',
                            scope: $scope,
                            preserveScope: true,
                            clickOutsideToClose: true,
                            skipHide: true,
                            autoWrap: false
                        });
                    }
                } else {
                    if ($scope.categories.categoriesArray.length !== 0) {
                        $mdDialog.show({
                            controller: 'toExistingMdDialogCont',
                            templateUrl: 'toExistingCatMdDialog.html',
                            scope: $scope,
                            preserveScope: true,
                            clickOutsideToClose: true,
                            autoWrap: true,
                            skipHide: true
                        });
                    } else {
                        //alert('There are no exiting expense categories. Please select Add to new category.');
                        $scope.errorNumber.value = 420;
                        $scope.errorMessage.errorString = 'There are no exiting expense categories. Please select Add to new category.';
                        $mdDialog.show({
                            controller: 'errorMdDialogCont',
                            templateUrl: 'errorMdDialog.html',
                            scope: $scope,
                            preserveScope: true,
                            clickOutsideToClose: true,
                            skipHide: true,
                            autoWrap: false
                        });
                    }
                }

            } else {
                //alert('The amount can not be "0".');
                $scope.errorNumber.value = 421;
                $scope.errorMessage.errorString = 'The amount can not be "0".';
                $mdDialog.show({
                    controller: 'errorMdDialogCont',
                    templateUrl: 'errorMdDialog.html',
                    scope: $scope,
                    preserveScope: true,
                    clickOutsideToClose: true,
                    skipHide: true,
                    autoWrap: false
                });
            }
        } else {
            //alert('Please specify a numeric value.');
            $scope.errorNumber.value = 422;
            $scope.errorMessage.errorString = 'Please specify a numeric value.';
            $mdDialog.show({
                controller: 'errorMdDialogCont',
                templateUrl: 'errorMdDialog.html',
                scope: $scope,
                preserveScope: true,
                clickOutsideToClose: true,
                skipHide: true,
                autoWrap: false
            });
        }
    }

    $scope.openToNewCategoryMdDialog = function() {
        if ($scope.amount.value !== null) {
            if ($scope.amount.value != 0) {
                console.log($scope.amount.value);
                $mdDialog.show({
                    controller: 'toNewMdDialogCont',
                    templateUrl: 'toNewMdDialog.html',
                    scope: $scope,
                    preserveScope: true,
                    clickOutsideToClose: true,
                    autoWrap: true,
                    skipHide: true
                });
            } else {
                //alert('The amount can not be "0".');
                $scope.errorNumber.value = 421;
                $scope.errorMessage.errorString = 'The amount can not be "0".';
                $mdDialog.show({
                    controller: 'errorMdDialogCont',
                    templateUrl: 'errorMdDialog.html',
                    scope: $scope,
                    preserveScope: true,
                    clickOutsideToClose: true,
                    skipHide: true,
                    autoWrap: false
                });
            }
        } else {
            //alert('Please specify a numeric value.');
            $scope.errorNumber.value = 422;
            $scope.errorMessage.errorString = 'Please specify a numeric value.';
            $mdDialog.show({
                controller: 'errorMdDialogCont',
                templateUrl: 'errorMdDialog.html',
                scope: $scope,
                preserveScope: true,
                clickOutsideToClose: true,
                skipHide: true,
                autoWrap: false
            });
        }
    }

    $scope.closeDialog = function() {
        $mdDialog.hide();
    }
    
}]);

// Add to NEW CATEGORY md-dialog controller.
angular.module('PFApp').controller('toNewMdDialogCont', ['$scope', '$mdDialog', function($scope, $mdDialog) {

    $scope.newCat = '';
    $scope.entryComment = {
        comment: null
    }

    $scope.graph = function() {
        if ($scope.newCat !== '' || $scope.newCat !== null) {
            if ($scope.newCat.match(/[a-z]/i)) {
                // Crear lo del date
                var seconds = $scope.entryDate.date.getTime() / 1000;
                var d = new Date(0);
                d.setUTCSeconds(seconds);
                if ($scope.isIncome.bool) {
                    // Es de income.
                    var object = {
                        id: $scope.id,
                        type: 'Income',
                        category: $scope.newCat,
                        amount: $scope.amount.value,
                        comment: $scope.entryComment.comment,
                        date: seconds,
                        indispensable: null
                    };
                    $scope.id++;
                    $scope.incomeEntries.incomeEntriesArray.push(object);
                    $scope.IEentries.IEentriesArray.push(object);
                    if ($scope.incomeCategories.incomeCategoriesArray.indexOf($scope.newCat) === -1) {
                        // Resultó ser una categoria income no existente.
                        $scope.incomeCategories.incomeCategoriesArray.push($scope.newCat);
                    }
                    $scope.newCat = null;
                    $scope.graphMain();
                    // Close all windows.
                    $mdDialog.hide();
                    $scope.closeDialog();
                } else {
                    // Es de expense.
                    var object = {
                        id: $scope.id,
                        type: 'Expense',
                        category: $scope.newCat,
                        amount: $scope.amount.value,
                        comment: $scope.entryComment.comment,
                        date: seconds,
                        indispensable: null
                    };
                    $scope.id++;
                    $scope.entries.entriesArray.push(object);
                    $scope.IEentries.IEentriesArray.push(object);
                    if ($scope.categories.categoriesArray.indexOf($scope.newCat) === -1) {
                        // Resultó ser una categoria expense no existente.
                        $scope.categories.categoriesArray.push($scope.newCat);
                    }
                    $scope.newCat = null;
                    $scope.graphMain();
                    // Close all windows.
                    $mdDialog.hide();
                    $scope.closeDialog();
                }
            } else {
                // Error: Categories must contain letters.
                $scope.errorNumber.value = 424;
                $scope.errorMessage.errorString = 'Categories must contain letters.';
                $mdDialog.show({
                    controller: 'errorMdDialogCont',
                    templateUrl: 'errorMdDialog.html',
                    scope: $scope,
                    preserveScope: true,
                    clickOutsideToClose: true,
                    skipHide: true,
                    autoWrap: false
                });
            }
        } else {
            alert($scope.newCat);
            // Error: Please type a new category.
            $scope.errorNumber.value = 425;
            $scope.errorMessage.errorString = 'Please type a new category.';
            $mdDialog.show({
                controller: 'errorMdDialogCont',
                templateUrl: 'errorMdDialog.html',
                scope: $scope,
                preserveScope: true,
                clickOutsideToClose: true,
                skipHide: true,
                autoWrap: false
            });
        }
    }

}]);

// Add to EXISTING CATEGORY md-dialog controller.
angular.module('PFApp').controller('toExistingMdDialogCont', ['$scope', '$mdDialog', function($scope, $mdDialog) {
    var changed = false;
    $scope.selectedCategory;
    $scope.categoriesDM;
    if ($scope.isIncome.bool) {
        $scope.categoriesDM = $scope.incomeCategories.incomeCategoriesArray;
    } else {
        $scope.categoriesDM = $scope.categories.categoriesArray;
    }
    $scope.handleChange = function() {
        console.log($scope.selectedCategory);
        changed = true;
    };

    $scope.graph = function() {

        if (changed) {
            // Crear lo del date
            var seconds = $scope.entryDate.date.getTime() / 1000;
            var d = new Date(0);
            d.setUTCSeconds(seconds);
            if ($scope.isIncome.bool) {
                var object = {
                    id: $scope.id,
                    type: 'Income',
                    category: $scope.selectedCategory,
                    amount: $scope.amount.value,
                    comment: $scope.entryComment.comment,
                    date: seconds,
                    indispensable: null
                };
                $scope.id++;
                $scope.incomeEntries.incomeEntriesArray.push(object);
                $scope.IEentries.IEentriesArray.push(object);
            } else {
                var object = {
                    id: $scope.id, 
                    type: 'Expense',
                    category: $scope.selectedCategory,
                    amount: $scope.amount.value,
                    comment: $scope.entryComment.comment,
                    date: seconds,
                    indispensable: null,
                    id: 'Expense' + $scope.newCat + $scope.amount.value + $scope.entryComment.comment + seconds + null
                };
                $scope.id++;
                $scope.entries.entriesArray.push(object);
                $scope.IEentries.IEentriesArray.push(object);
            }
            $scope.selectedCategory = null;
            $scope.graphMain();
            // Close all windows.
            $mdDialog.hide();
            $scope.closeDialog();
        } else {
            //alert('Please select a category.');
            $scope.errorNumber.value = 423;
            $scope.errorMessage.errorString = 'Please select a category.';
            $mdDialog.show({
                controller: 'errorMdDialogCont',
                templateUrl: 'errorMdDialog.html',
                scope: $scope,
                preserveScope: true,
                clickOutsideToClose: true,
                skipHide: true,
                autoWrap: false
            });
        }
    }

}]);

// ERROR md-dialog controller.
angular.module('PFApp').controller('errorMdDialogCont', ['$scope', function($scope) {

    $scope.number = $scope.errorNumber.value;
    $scope.message = $scope.errorMessage.errorString;

}]);