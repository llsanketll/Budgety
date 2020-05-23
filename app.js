// Budget Controller
var budgetController = (function () {
    //Private:

    //Functrion Constructor
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercent = function(totalIncome){
        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome)* 100);
        } else{
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercent = function(){
        return this.percentage;
    };

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };


    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (cur) {
            sum += cur.value;
        });
        data.total[type] = sum;

    };

    var data = {
        //Will store struct of ID, desc, and value in an array
        allItems: {
            exp: [],
            inc: []
        },
        total: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        precentage: -1
    };

    //Public:
    return {
        addItem: function (type, des, val) {
            var newItem, ID;

            //Create new ID
            if (data.allItems[type].length > 0)
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            else
                ID = 0;

            // Create new item depending on the type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            //Push it into our data structure
            data.allItems[type].push(newItem);

            //Return the new element
            return newItem;
        },

        deleteItem: function (type, id) {
            var ids, index;
            ids = data.allItems[type].map(function (curr) {
                return curr.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }

        },

        calculateBudget: function () {

            // Calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // Calculate the budget: income - expenses
            data.budget = data.total.inc - data.total.exp;

            // Calculate the % of income spent
            if (data.total.inc > 0) {
                data.precentage = Math.round((data.total.exp / data.total.inc) * 100);
            } else {
                data.precentage = -1;
            }
        },

        calculatePercentages: function(){
            data.allItems.exp.forEach(function(curr){
                curr.calcPercent(data.total.inc);
            });
        },

        getPercent: function(){
            var allPerc = data.allItems.exp.map(function(curr){
                return curr.getPercent();
            });
            return allPerc;
        },

        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.total.inc,
                totalExp: data.total.exp,
                percent: data.precentage,
            };
        },

        testing: function () {
            console.log(data);
        }
    };

})();


//UI Controller
var UIController = (function () {

    // Private Variables
    var DOMstrings = {
        inputType: '.add__type',
        inputDesc: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLable: '.budget__value',
        incomeLable: '.budget__income--value',
        expenseLable: '.budget__expenses--value',
        percentLable: '.budget__expenses--percentage',
        container: '.container',
        itemPercentLable: '.item__percentage',
        dataLable: '.budget__title--month'
    };

    var formatNumber = function(number){
        var numSplit;
        // + or - for inc and exp
        // 2 decimals
        // comma seperating the thousands

        number = number.toFixed(2);
        numSplit = number.split('.');

        int = numSplit[0];
        if (int.length > 3){
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }

        dec = numSplit[1];

        return int + '.' + dec;
    };

    var nodeListForEach = function(list, callback){
        for(var i = 0; i < list.length; i++){
            callback(list[i], i);
        }
    };
    //Public Methods
    return {
        // Function to get input
        getInput: function () {
            //Return the Inputs
            return {
                // Read the Input
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDesc).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },

        addListItem: function (obj, type) {
            var html, newHtml, element;
            // Create HTML string with placeholder tags
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div> <div class="right clearfix"><div class="item__value">+ %value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">- %value%</div><div class="item__percentage"></div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            //Replace teh placeholder with actual text
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value));

            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
            //Will be inserted as the last child
        },

        deleteListItem: function (selectorID) {
            var element = document.getElementById(selectorID);
            element.parentNode.removeChild(element);
        },

        //Removing the data in the input boxes
        clearFields: function () {
            var fields;
            fields = document.querySelectorAll(DOMstrings.inputDesc + ', ' + DOMstrings.inputValue);

            var fieldsArray = Array.prototype.slice.call(fields);
            fieldsArray.forEach(function (current) {
                current.value = "";
            });
            //Setting the focus back to description
            fieldsArray[0].focus();
        },

        displayBudget: function (obj) {
            
            document.querySelector(DOMstrings.budgetLable).textContent = '$ ' + obj.budget.toLocaleString();
            document.querySelector(DOMstrings.incomeLable).textContent = '+ ' + formatNumber(obj.totalInc);
            document.querySelector(DOMstrings.expenseLable).textContent = '- ' + formatNumber(obj.totalExp);

            if (obj.percent > 0) {
                document.querySelector(DOMstrings.percentLable).textContent = obj.percent + '%';
            } else {
                document.querySelector(DOMstrings.percentLable).textContent = '---';
            }

        },

        displayPercentages: function(percentages){
            var fields = document.querySelectorAll(DOMstrings.itemPercentLable);

            nodeListForEach(fields, function(curr, index){
                if(percentages[index] > 0){
                curr.textContent = percentages[index] + '%';
                } else {
                    curr.textContent = '---';
                }
            });
        },

        displayMonth: function(){
            var now, year, month, monthArray;
            now = new Date();

            monthArray = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'Sepetember', 'October', 'December'];
            month = now.getMonth();
            year = now.getFullYear();

            document.querySelector(DOMstrings.dataLable).textContent = monthArray[month] + ' ' + year;
        },

        changedType :function(){
            var fields = document.querySelectorAll(DOMstrings.inputType + ',' + DOMstrings.inputDesc + ',' + DOMstrings.inputValue);
            nodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus');
            })

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },

        getDOMstrings: function () {
            return DOMstrings;
        }
    };

})();


//Global App controller
var appController = (function (budgetCtrl, UICtrl) {

    //Private:
    // Add event Listeners
    var setupEventListeners = function () {
        var DOM = UICtrl.getDOMstrings();

        //On clicking the Check Mark
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        // On Pressing the Enter
        document.addEventListener('keypress', function (enter) {
            if (enter.keyCode === 13 || enter.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change',UICtrl.changedType);
    };

    var updateBudget = function () {
        // 1. Calculate the budget
        budgetCtrl.calculateBudget();

        // 2. Return the budget
        var budget = budgetCtrl.getBudget();

        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);
    };

    var updatePercentages = function () {
        // 1. Calculate percentages
        budgetCtrl.calculatePercentages();

        // 2. Read percentages frm the budge controler
        var percentages = budgetCtrl.getPercent();

        // 3. Update the UI with the new percentages
        UICtrl.displayPercentages(percentages);
    };

    var ctrlAddItem = function () {
        var input, newItem;
        //1. Get input values
        input = UICtrl.getInput();

        // Check if not empty
        if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
            // 2. Add the items to an array
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Update the UI
            UICtrl.addListItem(newItem, input.type);

            // 3.5 Clear the fields 
            UICtrl.clearFields();

            // 4. Update the budget
            updateBudget();

            // 5. Calculate and update percentages
            updatePercentages();
        }
    };

    var ctrlDeleteItem = function (e) {
        var itemID, splitID;
        itemID = e.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. Delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);
            // 2. Delete the item from the UI
            UICtrl.deleteListItem(itemID);
            // 3. Update and show the new budget
            updateBudget();
            // 4. Calc and update the new percentages
            updatePercentages();
        };
    };
    // Public:
    return {
        init: function () {
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percent: -1
            });
            setupEventListeners();
        }
    };

})(budgetController, UIController);

appController.init();