import {createElement} from "./createElement.js";

export class RangePicker {
    constructor({from, to}) {
        this.selected = {from, to};
        this.showDateFrom = new Date(to);
        this.showDateFrom.setMonth(to.getMonth() - 1);
        this.onSelectorClick = this.onSelectorClick.bind(this);
        this.onDocumentClick = this.onDocumentClick.bind(this);
        this.render();
    }

    render() {
        this.elem = createElement(`<div class="rangepicker">
            <div class="rangepicker__input" data-elem="input">
                <span data-elem="from">${this.selected.from.toLocaleString('default', {dateStyle: 'short'})}</span> -
                <span data-elem="to">${this.selected.to.toLocaleString('default', {dateStyle: 'short'})}</span>
            </div>
            <div class="rangepicker__selector" data-elem="selector"></div>
        </div>`);

        //don't select text
        this.elem.onmousedown = () => false;

        this.elems = {};
        for (let subElem of this.elem.querySelectorAll('[data-elem]')) {
            this.elems[subElem.dataset.elem] = subElem;
        }

        this.elems.input.onclick = () => this.toggle();

        this.elems.selector.addEventListener('click', this.onSelectorClick);

        document.addEventListener('click', this.onDocumentClick, true)
    };

    onDocumentClick(event) {
        if (this.elem.contains(event.target)) return;
        this.close();
    }

    close() {
        this.elem.classList.remove('rangepicker_open');
    }

    onSelectorClick(event) {
        if (event.target.classList.contains('rangepicker__cell')) {
            this.onRangePickerCellClick(event);
        }
    }

    onRangePickerCellClick(event) {
        let cell = event.target;
        let valueDate = new Date(cell.dataset.value);
        if(!valueDate) return;

        if (this.selected.to) {
            this.selected.to = null;
            this.selected.from = valueDate;
        } else if (!this.selected.to && valueDate < this.selected.from) {
            this.selected.to = this.selected.from;
            this.selected.from = valueDate;
        } else {
            this.selected.to = valueDate;
        }
        this.renderHighLight();

        if (this.selected.from && this.selected.to) {
            let customEvent = new CustomEvent('date-select', {
                bubbles: true,
                detail: this.selected
            });
            this.elem.dispatchEvent(customEvent);
            this.close();
            this.elems.from.innerHTML = this.selected.from.toLocaleString('default', {dateStyle: 'short'});
            this.elems.to.innerHTML = this.selected.to.toLocaleString('default', {dateStyle: 'short'});


        }
    }

    toggle() {
        this.elem.classList.toggle('rangepicker_open');
        this.renderSelector();
    }


    renderSelector() {
        let showDate1 = new Date(this.showDateFrom);
        let showDate2 = new Date(this.showDateFrom);
        showDate2.setMonth(showDate2.getMonth() + 1);

        this.elems.selector.innerHTML = `
            <div class="rangepicker__selector-arrow"></div>
            <div class="rangepicker__selector-control-left"></div>
            <div class="rangepicker__selector-control-right"></div>
            ${this.renderCalendar(showDate1)}
            ${this.renderCalendar(showDate2)}`;

        this.renderHighLight();

        this.elems.selector.querySelector(".rangepicker__selector-control-left").onclick = () => this.prev();
        this.elems.selector.querySelector(".rangepicker__selector-control-right").onclick = () => this.next();

    }

    prev() {
        this.showDateFrom.setMonth(this.showDateFrom.getMonth() - 1);
        this.renderSelector();
    }

    next() {
        this.showDateFrom.setMonth(this.showDateFrom.getMonth() + 1);
        this.renderSelector();
    }


    renderCalendar(showDate) {
        let currentDate = new Date(showDate);
        currentDate.setDate(1);
        let mon = currentDate.getMonth();
        let monString = currentDate.toLocaleDateString('En', {month: 'long'});
        let calendarTableHTML = `<div class="rangepicker__calendar">
            <div class="rangepicker__month-indicator">
                <time datetime="${monString}">${monString}</time>
            </div>
            <div class="rangepicker__day-of-week">
                <div>Пн</div>
                <div>Вт</div>
                <div>Ср</div>
                <div>Чт</div>
                <div>Пт</div>
                <div>Сб</div>
                <div>Вс</div>
            </div>
            <div class="rangepicker__date-grid">`;


        while (currentDate.getMonth() === mon) {
            let dateNumber = currentDate.getDate();
            calendarTableHTML += dateNumber == 1 ?
                `<button type="button" class="rangepicker__cell" style="--start-from: ${this.getDay(currentDate)}"
                            data-value="${currentDate.toISOString()}">${dateNumber}
                    </button>` :
                `<button type="button" class="rangepicker__cell"
                            data-value="${currentDate.toISOString()}">${dateNumber}
                    </button>`;

            currentDate.setDate(dateNumber + 1);
        }

        calendarTableHTML += '</div></div>';

        return calendarTableHTML;

    }

    getDay(date) {
        let day = date.getDay();
        if (day == 0) day = 7;
        return day;
    }

    renderHighLight() {
        for (let cell of this.elem.querySelectorAll('.rangepicker__cell')) {
            cell.classList.remove('rangepicker__selected-from');
            cell.classList.remove('rangepicker__selected-between');
            cell.classList.remove('rangepicker__selected-to');
            if (this.selected.from && cell.dataset.value == this.selected.from.toISOString()) {
                cell.classList.toggle('rangepicker__selected-from');
            } else if (this.selected.to  && cell.dataset.value == this.selected.to.toISOString()) {
                cell.classList.toggle('rangepicker__selected-to');
            } else if (this.selected.from && this.selected.to &&
                new Date(cell.dataset.value) >= this.selected.from && new Date(cell.dataset.value) <= this.selected.to)  {
                cell.classList.toggle('rangepicker__selected-between');
            }
        }
    }

}