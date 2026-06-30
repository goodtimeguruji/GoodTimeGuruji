import { runAuspiciousCheck } from "./muhurat-core.js";

const CONFIG = {
  secondNakshatraList: ["Ashwini","Rohini","Ardhra","Punarvasu","Pushya","Uttara Phalguni","Hasta","Chitra","Swati","Anuradha","Shravan","Dhanishta","Satabhisha","Uttara Bhadrapada","Revati"],
  disallowedTithis:    ["Pratipada","Chaturthi","Shasthi","Ashtami","Navami","Dwadashi","Chaturdashi","Purnima","Amavasya"],
  timeMode:            "morning",  // morning=00-13 | day=00-18 | evening=18-24
  lagnaPlace:          4   // 4th house (Mercury/education) validated via Planetary Position API
};

export default function runAuspiciousCheckAcrossDatesVidhyaarambha(fromDateStr, toDateStr, userNakshatra, userRasi, lat, lon, tzone, place) {
  return runAuspiciousCheck(fromDateStr, toDateStr, userNakshatra, userRasi, lat, lon, tzone, place, CONFIG);
}