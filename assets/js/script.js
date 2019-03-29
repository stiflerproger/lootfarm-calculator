'use strict'

// история трейдов
var trade_history = [];
var start_check, end_check;

var profit_color = 'white';

var append_menu = `
    <div class="profit-menu">
        <ul>
            <li class="mark-start">Отметить начало круга</li>
            <li class="mark-end">Отметить конец круга</li>
        </ul>
    </div>
`;


$(document).ready(function() {
    init();
});

function init() {
    if (!$('#tableBody').length) return setTimeout(init, 1000);

    loadStorage();

    $('#tableBody').on('click', 'tr', function() {
        if (!$(this).find('.profit-menu').length) {
            $(this).append(append_menu);
        }

        $('.profit-menu').hide();
        $(this).find('.profit-menu').show();
    });

    $('#tableBody').on('click', '.mark-start', function(e) {
        e.stopPropagation();

        $('.profit-menu').hide();

        $('tr[profit-start]').removeAttr('profit-start');

        $(this).parent().parent().parent().attr('profit-start', ''); // tr

        saveProfitRange();
    });

    $('#tableBody').on('click', '.mark-end', function(e) {
        e.stopPropagation();

        $('.profit-menu').hide();

        $('tr[profit-end]').removeAttr('profit-end');

        $(this).parent().parent().parent().attr('profit-end', ''); // tr

        saveProfitRange();
    });

    $('#tableBody').on('click', '.remove-profit', function(e) {
        e.stopPropagation();

        $('.profit-menu').hide();

        let profit_id = $(this).parent().parent().find('a[target="loottrade"]').attr('href'); // tr

        let middle_array = [];

        for (let profit_stack of trade_history) {
            if (profit_stack[0] !== profit_id) {
                middle_array.push(profit_stack);
            }
        }

        trade_history = middle_array;

        window.localStorage["profit-history"] = JSON.stringify(trade_history);

        showProfits();
    });

    showProfits();
}

function saveProfitRange() {

    if (!$('tr[profit-end]').length || !$('tr[profit-start]').length) {
        return;
    }

    let range = [];

    $('#tableBody tr').each(function() {
        if ($(this)[0].hasAttribute('profit-start')) {
            range.push($(this).find('a[target="loottrade"]').attr('href'));
        }

        if ($(this)[0].hasAttribute('profit-end')) {
            range.push($(this).find('a[target="loottrade"]').attr('href'));
        }

        if (range.length == 2) {
            trade_history.push(range);
            return false;
        }
    });

    window.localStorage["profit-history"] = JSON.stringify(trade_history);

    $('tr[profit-start]').removeAttr('profit-start');
    $('tr[profit-end]').removeAttr('profit-end');

    showProfits();
}

function loadStorage() {
    if (!window.localStorage["profit-history"]) {
        window.localStorage["profit-history"] = JSON.stringify([]);
    }

    trade_history = JSON.parse(window.localStorage["profit-history"]);
}

function showProfits() {
    // удаляем старые профиты
    $('.my-profit').remove();

    for (let profit_stack of trade_history) {
        let $show;
        let profit = [0,0]; // профит, бонусы
        $('#tableBody tr').each(function() {
            if (!$show) {
                // ищём первый элемент
                if ($(this).find('a[target="loottrade"]').attr('href') == profit_stack[0]) {
                    $show = $(this);
                }
            }

            if ($show) {

                if ($(this).find('.ok').length) {
                    // транзакция завершена, можно считать
                    let yours = +(+$($(this).find('td')[4]).text().replace('USD', '') * 100).toFixed(2),
                        ours = +(+$($(this).find('td')[5]).text().replace('USD', '') * 100).toFixed(2),
                        bonus = +(+$($(this).find('td')[6]).text().replace('USD', '') * 100).toFixed(2);

                    profit[0] += (yours - ours);
                    profit[1] += bonus;
                }

                if ($(this).find('a[target="loottrade"]').attr('href') == profit_stack[1]) {

                    $show.append(`
                        <div class="my-profit" style="border-bottom: 3px solid ${profit_color};">
                            <span class="${profit[0]>=0 ? 'green' : 'orange'}">${profit[0] / 100}$</span> ${profit[1] ? ' <span class="bonus">[+' + (profit[1] / 100) + '$]</span>' : ''}
                            <span class="remove-profit">remove</span>
                        </div>
                    `);
                    $(this).append(`
                        <div class="my-profit arrow" style="color:${profit_color};">
                            &#8657;
                        </div>
                    `);

                    profit_color = profit_color == 'white' ? 'yellow' : 'white';

                    return false;

                }
            }
        });

    }


}