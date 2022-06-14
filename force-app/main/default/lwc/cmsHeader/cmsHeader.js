import { LightningElement, api } from "lwc";

const defaultNav = [
  "Home",
  "Become a Dasher",
  "Dasher Store",
  "Community Council",
  "Topics"
];

export default class RocketHeader extends LightningElement {
  @api
  get items() {
    return this._items;
  }
  set items(value) {
    if (value) {
      this._items = value.split(",");
    } else {
      value = defaultNav;
    }
  }
}