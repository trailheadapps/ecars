import { LightningElement, wire, track } from 'lwc';
import getAvailableCarOptions from './getAvailableCarOptions';

const BASE_IMAGE_URL = 'https://sfdc-demo.s3-us-west-1.amazonaws.com/ecars';

export default class Configurator extends LightningElement {
    currentSection = 1;
    modelName = 'Neutron LGM-1 Sedan';

    @track ranges = [];
    @track exteriorColors = [];
    @track interiorColors = [];
    
    modelId;

    @wire(getAvailableCarOptions, { modelName: '$modelName' })
    processData(data) {
        if (data) {
            this.modelId = data.recordId;
            this.ranges = data.allOptions.RangeOptions.map((obj, index) => {
                return {
                    ...obj,
                    className: `range-option ${index === 0 ? 'selected' : ''}`
                };
            });
            this.exteriorColors = data.allOptions.ExteriorColors.map(
                (obj, index) => {
                    return {
                        ...obj,
                        className: `color-option ${obj.code} ${
                            index === 0 ? 'selected' : ''
                        }`
                    };
                }
            );
            this.interiorColors = data.allOptions.InteriorColors.map(
                (obj, index) => {
                    return {
                        ...obj,
                        className: `color-option ${obj.code} ${
                            index === 0 ? 'selected' : ''
                        }`
                    };
                }
            );

            this.selectedRange = this.ranges[0];
            this.selectedExteriorColor = this.exteriorColors[0];
            this.selectedInteriorColor = this.interiorColors[0];
        }
    }

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
        this.ranges.forEach((range) => {
            let className = range.className.replace('selected', '');
            if (range.label === rangeLabel) {
                this.selectedRange = range;
                range.className = className + ' selected';
            } else {
                range.className = className;
            }
        });
    }

    handleExteriorColorChange(event) {
        const colorCode = event.currentTarget.dataset.color;
        this.exteriorColors.forEach((color) => {
            let className = color.className.replace('selected', '');
            if (color.code === colorCode) {
                this.selectedExteriorColor = color;
                color.className = className + ' selected';
            } else {
                color.className = className;
            }
        });
    }

    handleInteriorColorChange(event) {
        const colorCode = event.currentTarget.dataset.color;
        this.interiorColors.forEach((color) => {
            let className = color.className.replace('selected', '');
            if (color.code === colorCode) {
                this.selectedInteriorColor = color;
                color.className = className + ' selected';
            } else {
                color.className = className;
            }
        });
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
