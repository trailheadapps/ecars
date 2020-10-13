import { LightningElement } from 'lwc';

const BASE_IMAGE_URL = 'https://sfdc-demo.s3-us-west-1.amazonaws.com/ecars';

export default class Configurator extends LightningElement {
    currentSection = 1;

    ranges = [
        {
            label: 'Short Range',
            price: 25000,
            className: 'range-option selected'
        },
        { label: 'Medium Range', price: 35000, className: 'range-option' },
        { label: 'Long Range', price: 45000, className: 'range-option' }
    ];

    exteriorColors = [
        {
            label: 'Pearl White',
            code: 'white',
            price: 0,
            className: 'color-option white selected'
        },
        {
            label: 'VIP Black',
            code: 'black',
            price: 1000,
            className: 'color-option black'
        },
        {
            label: 'Pulsar Red',
            code: 'red',
            price: 2000,
            className: 'color-option red'
        },
        {
            label: 'Deep Blue',
            code: 'blue',
            price: 2000,
            className: 'color-option blue'
        },
        {
            label: 'Modern Green',
            code: 'green',
            price: 2000,
            className: 'color-option green'
        }
    ];

    interiorColors = [
        {
            label: 'Vegan White',
            code: 'white',
            price: 0,
            className: 'color-option white selected'
        },
        {
            label: 'Vegan Black',
            code: 'black',
            price: 1000,
            className: 'color-option black'
        },
        {
            label: 'Vegan Tan',
            code: 'tan',
            price: 2000,
            className: 'color-option tan'
        }
    ];

    selectedRange = this.ranges[0];
    selectedExteriorColor = this.exteriorColors[0];
    selectedInteriorColor = this.interiorColors[0];
    leadRecordId = '';

    get imgUrl() {
        if (this.currentSection === 3) {
            return `${BASE_IMAGE_URL}/car_interior_${this.selectedInteriorColor.code}.jpg`;
        } else if (this.currentSection === 2 || this.currentSection === 4) {
            return `${BASE_IMAGE_URL}/car_${this.selectedExteriorColor.code}.jpg`;
        }
        return `${BASE_IMAGE_URL}/car_white.jpg`;
    }

    get imgClass() {
        if (this.currentSection === 3) {
            return 'container-images';
        }
        return 'container-images padded';
    }

    handleRangeChange(event) {
        const rangeLabel = event.currentTarget.dataset.range;
        let ranges = [];
        this.ranges.forEach((range) => {
            let className = 'range-option';
            if (range.label === rangeLabel) {
                this.selectedRange = range;
                className = className + ' selected';
            }
            ranges.push({
                label: range.label,
                price: range.price,
                className
            });
        });
        this.ranges = ranges;
    }

    handleExteriorColorChange(event) {
        const colorCode = event.currentTarget.dataset.color;
        let colors = [];
        this.exteriorColors.forEach((color) => {
            let className = 'color-option';
            if (color.code === colorCode) {
                this.selectedExteriorColor = color;
                className = className + ' selected';
            }
            colors.push({
                label: color.label,
                code: color.code,
                price: color.price,
                className: className + ' ' + color.code
            });
        });
        this.exteriorColors = colors;
    }

    handleInteriorColorChange(event) {
        const colorCode = event.currentTarget.dataset.color;
        let colors = [];
        this.interiorColors.forEach((color) => {
            let className = 'color-option';
            if (color.code === colorCode) {
                this.selectedInteriorColor = color;
                className = className + ' selected';
            }
            colors.push({
                label: color.label,
                code: color.code,
                price: color.price,
                className: className + ' ' + color.code
            });
        });
        this.interiorColors = colors;
    }

    handleLeadChange(event) {
        this.leadRecordId = event.target.value;
    }

    handleNext() {
        this.currentSection = this.currentSection + 1;
    }

    handlePrevious() {
        this.currentSection = this.currentSection - 1;
    }

    get hasNextSection() {
        return this.currentSection < this.numberOfSections;
    }

    get hasPreviousSection() {
        return this.currentSection > 1;
    }

    get isSection1() {
        return this.currentSection === 1;
    }
    get isSection2() {
        return this.currentSection === 2;
    }
    get isSection3() {
        return this.currentSection === 3;
    }
    get isSection4() {
        return this.currentSection === 4;
    }
}
