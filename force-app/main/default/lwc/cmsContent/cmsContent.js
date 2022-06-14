import { LightningElement, api } from "lwc";

export default class RocketCMSSection extends LightningElement {
  @api image;
  @api width;

  get imgWidth() {
    if (this.width !== "") {
      return `max-width:${this.width}%`;
    } else {
      return `max-width:100%`;
    }
  }
}