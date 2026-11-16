/* Leaveby core: airport data, simulation, and the planning bridge.
   No DOM. Loaded as a classic script in the browser (window.Leaveby)
   and imported for its side effect in Node tests (globalThis.Leaveby). */
(function (root) {
"use strict";

/* ============================================================
   Airport reference data
   Checkpoints, lanes, hours (local), and walk minutes from each
   checkpoint to each concourse. Gates map to concourses by letter
   prefix, or by numeric range where an airport uses plain numbers.
   Hours [0,24] means the checkpoint never closes.
   ============================================================ */
const AIRPORTS = {
  SFO: { name: "San Francisco International", city: "San Francisco", tz: "America/Los_Angeles", base: 18, profile: "hub",
    checkpoints: [
      { id: "sfo-b", name: "Terminal 1 · Checkpoint B", terminal: "1", lanes: ["std","pre","clear"], hours: [3.5, 24], f: 1.0, walk: { B: 4, C: 9, D: 14, A: 12, E: 18, F: 20, G: 22 } },
      { id: "sfo-c", name: "Terminal 1 · Checkpoint C", terminal: "1", lanes: ["std","pre"], hours: [4, 22], f: .8, walk: { C: 4, B: 8, D: 10, A: 16, E: 16, F: 18, G: 24 } },
      { id: "sfo-d", name: "Terminal 2 · Checkpoint D", terminal: "2", lanes: ["std","pre","clear"], hours: [4, 23], f: .9, walk: { D: 4, C: 10, E: 9, B: 14, F: 13, A: 22, G: 18 } },
      { id: "sfo-e", name: "Terminal 3 · Checkpoint E", terminal: "3", lanes: ["std","pre"], hours: [4, 23], f: .85, walk: { E: 4, F: 7, D: 9, G: 14, C: 16, B: 20, A: 24 } },
      { id: "sfo-f", name: "Terminal 3 · Checkpoint F", terminal: "3", lanes: ["std","pre","clear"], hours: [0, 24], f: 1.15, walk: { F: 4, E: 6, G: 11, D: 13, C: 18, B: 22, A: 26 } },
      { id: "sfo-a", name: "International · Checkpoint A", terminal: "Intl", lanes: ["std","pre","clear"], hours: [4, 24], f: .95, walk: { A: 5, B: 9, G: 20, C: 16, D: 22 } },
      { id: "sfo-g", name: "International · Checkpoint G", terminal: "Intl", lanes: ["std","pre","clear"], hours: [4, 24], f: 1.05, walk: { G: 5, F: 9, E: 12, A: 20, D: 18 } },
    ] },
  ORD: { name: "Chicago O'Hare International", city: "Chicago", tz: "America/Chicago", base: 22, profile: "hub",
    checkpoints: [
      { id: "ord-1-2", name: "Terminal 1 · Checkpoint 2", terminal: "1", lanes: ["std","pre","clear"], hours: [0, 24], f: 1.1, walk: { B: 4, C: 11, E: 12, F: 14, G: 18, H: 20, K: 22, L: 24 } },
      { id: "ord-1-3", name: "Terminal 1 · Checkpoint 3", terminal: "1", lanes: ["std","pre"], hours: [4, 22], f: .9, walk: { B: 5, C: 10, E: 13, F: 15, G: 19, H: 21, K: 23, L: 25 } },
      { id: "ord-2-4", name: "Terminal 2 · Checkpoint 4", terminal: "2", lanes: ["std","pre","clear"], hours: [3.5, 24], f: .85, walk: { E: 4, F: 5, B: 10, C: 15, G: 9, H: 12, K: 14, L: 16 } },
      { id: "ord-3-7", name: "Terminal 3 · Checkpoint 7", terminal: "3", lanes: ["std","pre"], hours: [4, 23], f: .95, walk: { H: 5, K: 5, G: 8, L: 9, E: 12, F: 12, B: 20, C: 24 } },
      { id: "ord-3-8", name: "Terminal 3 · Checkpoint 8", terminal: "3", lanes: ["std","pre","clear"], hours: [3.5, 24], f: 1.05, walk: { G: 6, H: 5, K: 6, L: 8, E: 14, F: 13, B: 22, C: 26 } },
      { id: "ord-5", name: "Terminal 5 · Checkpoint", terminal: "5", lanes: ["std","pre","clear"], hours: [4, 24], f: .8, walk: { M: 5 } },
    ] },
  ATL: { name: "Hartsfield-Jackson Atlanta International", city: "Atlanta", tz: "America/New_York", base: 26, profile: "hub",
    checkpoints: [
      { id: "atl-main", name: "Domestic · Main Checkpoint", terminal: "Domestic", lanes: ["std","pre","clear"], hours: [0, 24], f: 1.2, walk: { T: 3, A: 7, B: 10, C: 13, D: 16, E: 19, F: 22 } },
      { id: "atl-north", name: "Domestic · North Checkpoint", terminal: "Domestic", lanes: ["std","pre"], hours: [4, 22], f: .9, walk: { T: 4, A: 8, B: 11, C: 14, D: 17, E: 20, F: 23 } },
      { id: "atl-south", name: "Domestic · South Checkpoint", terminal: "Domestic", lanes: ["std","pre","clear"], hours: [4, 23], f: .95, walk: { T: 4, A: 8, B: 11, C: 14, D: 17, E: 20, F: 23 } },
      { id: "atl-intl", name: "International · Checkpoint F", terminal: "Intl", lanes: ["std","pre","clear"], hours: [4, 24], f: .75, walk: { F: 4, E: 7, D: 10, C: 13, B: 16, A: 19, T: 22 } },
    ] },
  DEN: { name: "Denver International", city: "Denver", tz: "America/Denver", base: 24, profile: "leisure",
    checkpoints: [
      { id: "den-south", name: "South Checkpoint · Level 5", terminal: "Jeppesen", lanes: ["std","pre","clear"], hours: [0, 24], f: 1.1, walk: { A: 10, B: 14, C: 18 } },
      { id: "den-north", name: "North Checkpoint · Level 6", terminal: "Jeppesen", lanes: ["std","pre"], hours: [4, 22], f: .85, walk: { A: 11, B: 15, C: 19 } },
      { id: "den-bridge", name: "West Bridge Checkpoint · A", terminal: "Jeppesen", lanes: ["std","pre","clear"], hours: [4, 21], f: .95, walk: { A: 5, B: 14, C: 18 } },
    ] },
  LAX: { name: "Los Angeles International", city: "Los Angeles", tz: "America/Los_Angeles", base: 22, profile: "intl",
    numeric: [[1,19,"T1"],[20,29,"T2"],[30,39,"T3"],[40,49,"T4"],[50,59,"T5"],[60,69,"T6"],[70,79,"T7"],[80,89,"T8"],[100,225,"TB"]],
    checkpoints: [
      { id: "lax-1", name: "Terminal 1 · Checkpoint", terminal: "1", lanes: ["std","pre","clear"], hours: [3.5, 24], f: 1.0, walk: { T1: 5, T2: 22, T3: 24, TB: 26 } },
      { id: "lax-23", name: "Terminal 2/3 · Checkpoint", terminal: "2/3", lanes: ["std","pre","clear"], hours: [4, 24], f: .9, walk: { T2: 5, T3: 6, TB: 12, T1: 20 } },
      { id: "lax-4", name: "Terminal 4 · Checkpoint", terminal: "4", lanes: ["std","pre","clear"], hours: [4, 24], f: 1.05, walk: { T4: 5, T5: 9, TB: 12, T6: 14, T7: 18, T8: 20 } },
      { id: "lax-5", name: "Terminal 5 · Checkpoint", terminal: "5", lanes: ["std","pre","clear"], hours: [4, 23], f: .9, walk: { T5: 5, T4: 9, T6: 8, T7: 13, T8: 15, TB: 18 } },
      { id: "lax-6", name: "Terminal 6 · Checkpoint", terminal: "6", lanes: ["std","pre"], hours: [4, 23], f: .8, walk: { T6: 5, T5: 8, T7: 7, T8: 9, T4: 14, TB: 22 } },
      { id: "lax-78", name: "Terminal 7/8 · Checkpoint", terminal: "7/8", lanes: ["std","pre","clear"], hours: [3.5, 24], f: 1.1, walk: { T7: 5, T8: 6, T6: 7, T5: 13, T4: 18, TB: 26 } },
      { id: "lax-tb", name: "Tom Bradley · Checkpoint", terminal: "B", lanes: ["std","pre","clear"], hours: [0, 24], f: 1.15, walk: { TB: 6, T3: 12, T2: 14, T4: 12, T5: 18 } },
    ] },
  JFK: { name: "John F. Kennedy International", city: "New York", tz: "America/New_York", base: 20, profile: "intl",
    numeric: [[1,30,"J5"],[31,47,"J8"]],
    checkpoints: [
      { id: "jfk-1", name: "Terminal 1 · Checkpoint", terminal: "1", lanes: ["std","pre","clear"], hours: [4, 24], f: .95, walk: { "1": 5 } },
      { id: "jfk-4", name: "Terminal 4 · Checkpoint", terminal: "4", lanes: ["std","pre","clear"], hours: [0, 24], f: 1.15, walk: { A: 5, B: 9 } },
      { id: "jfk-5", name: "Terminal 5 · Checkpoint", terminal: "5", lanes: ["std","pre","clear"], hours: [3.5, 24], f: 1.0, walk: { J5: 5 } },
      { id: "jfk-7", name: "Terminal 7 · Checkpoint", terminal: "7", lanes: ["std","pre"], hours: [4, 23], f: .8, walk: { "7": 5 } },
      { id: "jfk-8", name: "Terminal 8 · Checkpoint", terminal: "8", lanes: ["std","pre","clear"], hours: [3.5, 24], f: 1.05, walk: { J8: 5, C: 12 } },
    ] },
  SEA: { name: "Seattle–Tacoma International", city: "Seattle", tz: "America/Los_Angeles", base: 24, profile: "hub",
    checkpoints: [
      { id: "sea-1", name: "Checkpoint 1 · South", terminal: "Main", lanes: ["std","pre"], hours: [4, 22], f: .85, walk: { A: 5, B: 4, C: 8, D: 10, N: 14, S: 16 } },
      { id: "sea-2", name: "Checkpoint 2", terminal: "Main", lanes: ["std","pre","clear"], hours: [3.5, 24], f: 1.05, walk: { B: 5, C: 6, D: 7, A: 8, N: 12, S: 14 } },
      { id: "sea-3", name: "Checkpoint 3 · Central", terminal: "Main", lanes: ["std","pre","clear"], hours: [0, 24], f: 1.15, walk: { C: 5, D: 6, B: 7, A: 10, N: 11, S: 13 } },
      { id: "sea-4", name: "Checkpoint 4", terminal: "Main", lanes: ["std","pre"], hours: [4, 23], f: .9, walk: { D: 4, C: 6, N: 10, S: 12, B: 9, A: 12 } },
      { id: "sea-5", name: "Checkpoint 5 · North", terminal: "Main", lanes: ["std","pre","clear"], hours: [4, 22], f: .95, walk: { N: 8, D: 6, S: 12, C: 8, B: 11, A: 14 } },
    ] },
  DFW: { name: "Dallas Fort Worth International", city: "Dallas", tz: "America/Chicago", base: 18, profile: "hub",
    checkpoints: [
      { id: "dfw-a", name: "Terminal A · Checkpoint A21", terminal: "A", lanes: ["std","pre","clear"], hours: [4, 23], f: 1.0, walk: { A: 5, B: 9, C: 9, D: 12, E: 12 } },
      { id: "dfw-b", name: "Terminal B · Checkpoint B30", terminal: "B", lanes: ["std","pre"], hours: [4, 22], f: .85, walk: { B: 5, A: 9, D: 9, C: 12, E: 14 } },
      { id: "dfw-c", name: "Terminal C · Checkpoint C21", terminal: "C", lanes: ["std","pre","clear"], hours: [0, 24], f: 1.1, walk: { C: 5, A: 9, D: 9, E: 9, B: 12 } },
      { id: "dfw-d", name: "Terminal D · Checkpoint D22", terminal: "D", lanes: ["std","pre","clear"], hours: [4, 24], f: 1.05, walk: { D: 5, B: 9, C: 9, E: 9, A: 12 } },
      { id: "dfw-e", name: "Terminal E · Checkpoint E16", terminal: "E", lanes: ["std","pre"], hours: [4, 22], f: .9, walk: { E: 5, C: 9, D: 9, A: 12, B: 14 } },
    ] },
  BOS: { name: "Boston Logan International", city: "Boston", tz: "America/New_York", base: 16, profile: "hub",
    checkpoints: [
      { id: "bos-a", name: "Terminal A · Checkpoint", terminal: "A", lanes: ["std","pre","clear"], hours: [3.5, 23], f: 1.0, walk: { A: 5, E: 12, B: 16, C: 20 } },
      { id: "bos-b1", name: "Terminal B · Checkpoint B1 (Airside)", terminal: "B", lanes: ["std","pre","clear"], hours: [4, 23], f: 1.05, walk: { B: 5, C: 12, A: 16 } },
      { id: "bos-b2", name: "Terminal B · Checkpoint B2", terminal: "B", lanes: ["std","pre"], hours: [4, 22], f: .85, walk: { B: 6, C: 11, A: 17 } },
      { id: "bos-c", name: "Terminal C · Checkpoint", terminal: "C", lanes: ["std","pre","clear"], hours: [0, 24], f: 1.1, walk: { C: 5, E: 8, B: 12 } },
      { id: "bos-e", name: "Terminal E · Checkpoint", terminal: "E", lanes: ["std","pre","clear"], hours: [4, 24], f: .9, walk: { E: 5, C: 8, A: 12 } },
    ] },
  MIA: { name: "Miami International", city: "Miami", tz: "America/New_York", base: 24, profile: "intl",
    checkpoints: [
      { id: "mia-2", name: "Checkpoint 2 · Concourse D", terminal: "North", lanes: ["std","pre","clear"], hours: [0, 24], f: 1.15, walk: { D: 6, E: 12, F: 18 } },
      { id: "mia-3", name: "Checkpoint 3 · Concourse E", terminal: "Central", lanes: ["std","pre"], hours: [4, 23], f: .9, walk: { E: 5, D: 10, F: 8, G: 12 } },
      { id: "mia-4", name: "Checkpoint 4 · Concourse F", terminal: "Central", lanes: ["std","pre","clear"], hours: [4, 23], f: .95, walk: { F: 5, E: 8, G: 8, H: 12, D: 16 } },
      { id: "mia-6", name: "Checkpoint 6 · Concourse H", terminal: "South", lanes: ["std","pre","clear"], hours: [4, 24], f: 1.0, walk: { H: 5, J: 8, G: 8, F: 12 } },
    ] },
  LAS: { name: "Harry Reid International", city: "Las Vegas", tz: "America/Los_Angeles", base: 20, profile: "leisure",
    checkpoints: [
      { id: "las-ab", name: "Terminal 1 · A/B Gates Checkpoint", terminal: "1", lanes: ["std","pre","clear"], hours: [0, 24], f: 1.1, walk: { A: 5, B: 7, C: 14 } },
      { id: "las-c", name: "Terminal 1 · C Gates Checkpoint", terminal: "1", lanes: ["std","pre","clear"], hours: [4, 23], f: 1.0, walk: { C: 5, A: 12, B: 12 } },
      { id: "las-de", name: "Terminal 3 · D/E Gates Checkpoint", terminal: "3", lanes: ["std","pre","clear"], hours: [3.5, 24], f: .9, walk: { D: 8, E: 5 } },
    ] },
  MCO: { name: "Orlando International", city: "Orlando", tz: "America/New_York", base: 26, profile: "leisure",
    numeric: [[1,59,"W"],[70,129,"E"],[230,249,"C"]],
    checkpoints: [
      { id: "mco-west", name: "Terminals A/B · West Checkpoint", terminal: "A/B", lanes: ["std","pre","clear"], hours: [0, 24], f: 1.15, walk: { W: 8, E: 18 } },
      { id: "mco-east", name: "Terminals A/B · East Checkpoint", terminal: "A/B", lanes: ["std","pre","clear"], hours: [3.5, 24], f: 1.05, walk: { E: 8, W: 18 } },
      { id: "mco-c", name: "Terminal C · Checkpoint", terminal: "C", lanes: ["std","pre","clear"], hours: [4, 24], f: .8, walk: { C: 6 } },
    ] },
  EWR: { name: "Newark Liberty International", city: "Newark", tz: "America/New_York", base: 22, profile: "hub",
    checkpoints: [
      { id: "ewr-a", name: "Terminal A · Checkpoint", terminal: "A", lanes: ["std","pre","clear"], hours: [3.5, 24], f: 1.0, walk: { A: 6 } },
      { id: "ewr-b", name: "Terminal B · Checkpoint", terminal: "B", lanes: ["std","pre","clear"], hours: [4, 24], f: .95, walk: { B: 6 } },
      { id: "ewr-c1", name: "Terminal C · Checkpoint C1", terminal: "C", lanes: ["std","pre","clear"], hours: [0, 24], f: 1.15, walk: { C: 7 } },
      { id: "ewr-c3", name: "Terminal C · Checkpoint C3", terminal: "C", lanes: ["std","pre"], hours: [4, 22], f: .9, walk: { C: 9 } },
    ] },
  PHX: { name: "Phoenix Sky Harbor International", city: "Phoenix", tz: "America/Phoenix", base: 18, profile: "hub",
    checkpoints: [
      { id: "phx-3", name: "Terminal 3 · Checkpoint", terminal: "3", lanes: ["std","pre","clear"], hours: [4, 24], f: .9, walk: { E: 6, F: 8 } },
      { id: "phx-4a", name: "Terminal 4 · Checkpoint A", terminal: "4", lanes: ["std","pre","clear"], hours: [0, 24], f: 1.1, walk: { A: 5, B: 9, C: 12, D: 12 } },
      { id: "phx-4b", name: "Terminal 4 · Checkpoint B", terminal: "4", lanes: ["std","pre"], hours: [4, 22], f: .95, walk: { B: 5, A: 9, C: 10, D: 10 } },
      { id: "phx-4c", name: "Terminal 4 · Checkpoint C", terminal: "4", lanes: ["std","pre","clear"], hours: [4, 23], f: 1.0, walk: { C: 5, D: 6, B: 10, A: 12 } },
      { id: "phx-4d", name: "Terminal 4 · Checkpoint D", terminal: "4", lanes: ["std","pre"], hours: [4, 22], f: .85, walk: { D: 5, C: 6, B: 10, A: 12 } },
    ] },
  IAH: { name: "George Bush Intercontinental", city: "Houston", tz: "America/Chicago", base: 20, profile: "hub",
    checkpoints: [
      { id: "iah-a", name: "Terminal A · Checkpoint", terminal: "A", lanes: ["std","pre","clear"], hours: [3.5, 24], f: 1.0, walk: { A: 5, B: 12, C: 16, D: 20, E: 22 } },
      { id: "iah-b", name: "Terminal B · Checkpoint", terminal: "B", lanes: ["std","pre"], hours: [4, 23], f: .9, walk: { B: 5, A: 12, C: 10, D: 14, E: 16 } },
      { id: "iah-c", name: "Terminal C · Checkpoint", terminal: "C", lanes: ["std","pre","clear"], hours: [0, 24], f: 1.15, walk: { C: 5, B: 10, D: 8, E: 10, A: 16 } },
      { id: "iah-de", name: "Terminal D/E · Checkpoint", terminal: "D/E", lanes: ["std","pre","clear"], hours: [4, 24], f: 1.0, walk: { D: 5, E: 6, C: 8, B: 14, A: 20 } },
    ] },
  MSP: { name: "Minneapolis–Saint Paul International", city: "Minneapolis", tz: "America/Chicago", base: 18, profile: "hub",
    checkpoints: [
      { id: "msp-1n", name: "Terminal 1 · North Checkpoint", terminal: "1", lanes: ["std","pre","clear"], hours: [3.5, 24], f: 1.05, walk: { A: 10, B: 12, C: 6, D: 8, E: 10, F: 7, G: 14 } },
      { id: "msp-1s", name: "Terminal 1 · South Checkpoint", terminal: "1", lanes: ["std","pre","clear"], hours: [0, 24], f: 1.1, walk: { A: 8, B: 10, C: 8, D: 6, E: 8, F: 9, G: 12 } },
      { id: "msp-2", name: "Terminal 2 · Checkpoint", terminal: "2", lanes: ["std","pre"], hours: [4, 23], f: .85, walk: { H: 5 } },
    ] },
  DCA: { name: "Ronald Reagan Washington National", city: "Washington", tz: "America/New_York", base: 17, profile: "hub",
    numeric: [[1,9,"A"],[10,22,"B"],[23,45,"C"],[46,59,"E"]],
    checkpoints: [
      { id: "dca-1", name: "Terminal 1 · Checkpoint", terminal: "1", lanes: ["std","pre"], hours: [4, 22], f: .85, walk: { A: 5 } },
      { id: "dca-2s", name: "Terminal 2 · South Checkpoint", terminal: "2", lanes: ["std","pre","clear"], hours: [3.5, 24], f: 1.05, walk: { B: 5, C: 9, E: 14 } },
      { id: "dca-2n", name: "Terminal 2 · North Checkpoint", terminal: "2", lanes: ["std","pre","clear"], hours: [0, 24], f: 1.1, walk: { C: 5, E: 8, B: 10 } },
    ] },
  AUS: { name: "Austin-Bergstrom International", city: "Austin", tz: "America/Chicago", base: 20, profile: "leisure",
    numeric: [[1,36,"M"]],
    checkpoints: [
      { id: "aus-1", name: "Checkpoint 1 · West", terminal: "Barbara Jordan", lanes: ["std","pre","clear"], hours: [0, 24], f: 1.1, walk: { M: 8 } },
      { id: "aus-2", name: "Checkpoint 2 · East", terminal: "Barbara Jordan", lanes: ["std","pre"], hours: [4, 22], f: .9, walk: { M: 7 } },
      { id: "aus-3", name: "Checkpoint 3 · Central", terminal: "Barbara Jordan", lanes: ["std","pre","clear"], hours: [3.5, 23], f: 1.0, walk: { M: 6 } },
    ] },
  SAN: { name: "San Diego International", city: "San Diego", tz: "America/Los_Angeles", base: 16, profile: "leisure",
    numeric: [[1,19,"T1"],[20,51,"T2"]],
    checkpoints: [
      { id: "san-1", name: "Terminal 1 · Checkpoint", terminal: "1", lanes: ["std","pre","clear"], hours: [0, 24], f: 1.0, walk: { T1: 5, T2: 14 } },
      { id: "san-2w", name: "Terminal 2 · West Checkpoint", terminal: "2", lanes: ["std","pre","clear"], hours: [3.5, 24], f: 1.05, walk: { T2: 5, T1: 14 } },
      { id: "san-2e", name: "Terminal 2 · East Checkpoint", terminal: "2", lanes: ["std","pre"], hours: [4, 22], f: .9, walk: { T2: 6, T1: 12 } },
    ] },
  CLT: { name: "Charlotte Douglas International", city: "Charlotte", tz: "America/New_York", base: 20, profile: "hub",
    checkpoints: [
      { id: "clt-a", name: "Checkpoint A", terminal: "Main", lanes: ["std","pre","clear"], hours: [3.5, 24], f: 1.0, walk: { A: 5, B: 9, C: 13, D: 16, E: 18 } },
      { id: "clt-bc", name: "Checkpoint B/C", terminal: "Main", lanes: ["std","pre","clear"], hours: [0, 24], f: 1.15, walk: { B: 5, C: 6, A: 9, D: 10, E: 12 } },
      { id: "clt-de", name: "Checkpoint D/E", terminal: "Main", lanes: ["std","pre"], hours: [4, 23], f: .9, walk: { D: 5, E: 6, C: 9, B: 12, A: 16 } },
    ] },
  DTW: { name: "Detroit Metropolitan", city: "Detroit", tz: "America/New_York", base: 18, profile: "hub",
    checkpoints: [
      { id: "dtw-mc1", name: "McNamara · Checkpoint 1", terminal: "McNamara", lanes: ["std","pre","clear"], hours: [0, 24], f: 1.1, walk: { A: 6, B: 10, C: 13 } },
      { id: "dtw-mc3", name: "McNamara · Checkpoint 3", terminal: "McNamara", lanes: ["std","pre"], hours: [4, 22], f: .9, walk: { A: 8, B: 9, C: 11 } },
      { id: "dtw-north", name: "North Terminal · Checkpoint", terminal: "North", lanes: ["std","pre","clear"], hours: [3.5, 24], f: .95, walk: { D: 6 } },
    ] },
  PHL: { name: "Philadelphia International", city: "Philadelphia", tz: "America/New_York", base: 19, profile: "hub",
    checkpoints: [
      { id: "phl-aw", name: "Terminal A-West · Checkpoint", terminal: "A", lanes: ["std","pre","clear"], hours: [4, 24], f: .95, walk: { A: 6, B: 14 } },
      { id: "phl-ae", name: "Terminal A-East · Checkpoint", terminal: "A", lanes: ["std","pre"], hours: [4, 22], f: .9, walk: { A: 7, B: 10 } },
      { id: "phl-b", name: "Terminal B · Checkpoint", terminal: "B", lanes: ["std","pre","clear"], hours: [0, 24], f: 1.15, walk: { B: 5, C: 7, A: 12, D: 14 } },
      { id: "phl-c", name: "Terminal C · Checkpoint", terminal: "C", lanes: ["std","pre","clear"], hours: [3.5, 24], f: 1.05, walk: { C: 5, B: 7, D: 10, E: 14 } },
      { id: "phl-de", name: "Terminal D/E · Checkpoint", terminal: "D/E", lanes: ["std","pre","clear"], hours: [4, 23], f: 1.0, walk: { D: 5, E: 6, C: 10, F: 18 } },
      { id: "phl-f", name: "Terminal F · Checkpoint", terminal: "F", lanes: ["std","pre"], hours: [4, 22], f: .8, walk: { F: 5, E: 14 } },
    ] },
  SLC: { name: "Salt Lake City International", city: "Salt Lake City", tz: "America/Denver", base: 16, profile: "hub",
    checkpoints: [
      { id: "slc-1", name: "Checkpoint 1 · Main", terminal: "Main", lanes: ["std","pre","clear"], hours: [0, 24], f: 1.1, walk: { A: 6, B: 18 } },
      { id: "slc-2", name: "Checkpoint 2", terminal: "Main", lanes: ["std","pre"], hours: [4, 22], f: .9, walk: { A: 8, B: 20 } },
    ] },
  FLL: { name: "Fort Lauderdale–Hollywood International", city: "Fort Lauderdale", tz: "America/New_York", base: 22, profile: "leisure",
    checkpoints: [
      { id: "fll-1", name: "Terminal 1 · Checkpoint", terminal: "1", lanes: ["std","pre","clear"], hours: [3.5, 24], f: 1.05, walk: { B: 5, C: 8 } },
      { id: "fll-2", name: "Terminal 2 · Checkpoint", terminal: "2", lanes: ["std","pre"], hours: [4, 23], f: .9, walk: { D: 5 } },
      { id: "fll-3", name: "Terminal 3 · Checkpoint", terminal: "3", lanes: ["std","pre","clear"], hours: [0, 24], f: 1.15, walk: { E: 5, F: 7 } },
      { id: "fll-4", name: "Terminal 4 · Checkpoint", terminal: "4", lanes: ["std","pre","clear"], hours: [4, 24], f: 1.0, walk: { G: 5, H: 8 } },
    ] },
  BWI: { name: "Baltimore/Washington International", city: "Baltimore", tz: "America/New_York", base: 18, profile: "hub",
    checkpoints: [
      { id: "bwi-ab", name: "Concourse A/B · Checkpoint", terminal: "Main", lanes: ["std","pre","clear"], hours: [0, 24], f: 1.1, walk: { A: 5, B: 6, C: 14 } },
      { id: "bwi-c", name: "Concourse C · Checkpoint", terminal: "Main", lanes: ["std","pre"], hours: [4, 23], f: .95, walk: { C: 5, B: 10, D: 10 } },
      { id: "bwi-d", name: "Concourse D · Checkpoint", terminal: "Main", lanes: ["std","pre","clear"], hours: [3.5, 24], f: 1.0, walk: { D: 5, C: 9, E: 10 } },
      { id: "bwi-e", name: "Concourse E · Checkpoint", terminal: "Main", lanes: ["std","pre"], hours: [4, 22], f: .8, walk: { E: 5, D: 10 } },
    ] },
  IAD: { name: "Washington Dulles International", city: "Washington", tz: "America/New_York", base: 18, profile: "intl",
    checkpoints: [
      { id: "iad-east", name: "Main Terminal · East Checkpoint", terminal: "Main", lanes: ["std","pre","clear"], hours: [0, 24], f: 1.05, walk: { A: 14, B: 12, C: 16, D: 18 } },
      { id: "iad-west", name: "Main Terminal · West Checkpoint", terminal: "Main", lanes: ["std","pre","clear"], hours: [3.5, 24], f: 1.0, walk: { A: 12, B: 14, C: 16, D: 18 } },
    ] },
  MDW: { name: "Chicago Midway International", city: "Chicago", tz: "America/Chicago", base: 18, profile: "leisure",
    checkpoints: [
      { id: "mdw-main", name: "Main Checkpoint", terminal: "Main", lanes: ["std","pre","clear"], hours: [0, 24], f: 1.1, walk: { A: 8, B: 10, C: 12 } },
    ] },
  // Destinations without modeled checkpoints
  LHR: { name: "London Heathrow", city: "London", tz: "Europe/London" },
  CDG: { name: "Paris Charles de Gaulle", city: "Paris", tz: "Europe/Paris" },
  NRT: { name: "Tokyo Narita", city: "Tokyo", tz: "Asia/Tokyo" },
  HNL: { name: "Daniel K. Inouye International", city: "Honolulu", tz: "Pacific/Honolulu" },
  MEX: { name: "Mexico City International", city: "Mexico City", tz: "America/Mexico_City" },
  YYZ: { name: "Toronto Pearson", city: "Toronto", tz: "America/Toronto" },
};
const ORIGINS = Object.keys(AIRPORTS).filter(c => AIRPORTS[c].checkpoints);

const AIRLINES = {
  UA: { name: "United", hubs: ["SFO","ORD","DEN","LAX","EWR","IAH","IAD"], intl: true },
  AA: { name: "American", hubs: ["DFW","ORD","LAX","MIA","JFK","CLT","PHX","PHL","DCA"], intl: true },
  DL: { name: "Delta", hubs: ["ATL","JFK","LAX","SEA","BOS","MSP","DTW","SLC"], intl: true },
  WN: { name: "Southwest", hubs: ["DEN","DFW","LAX","BOS","LAS","MDW","BWI","PHX","AUS"], boarding: 30 },
  B6: { name: "JetBlue", hubs: ["JFK","BOS","FLL","MCO"] },
  AS: { name: "Alaska", hubs: ["SEA","SFO","LAX","SAN"] },
  NK: { name: "Spirit", hubs: ["MIA","DFW","LAX","FLL","LAS"] },
  F9: { name: "Frontier", hubs: ["DEN","MIA","MCO","LAS"] },
  HA: { name: "Hawaiian", hubs: ["LAX","SEA"] },
  BA: { name: "British Airways", hubs: ["JFK","SFO","BOS","IAD"], intl: true },
  LH: { name: "Lufthansa", hubs: ["JFK","SFO","ORD","IAD"], intl: true },
  AF: { name: "Air France", hubs: ["JFK","LAX"], intl: true },
  JL: { name: "Japan Airlines", hubs: ["LAX","SFO"], intl: true },
  AC: { name: "Air Canada", hubs: ["LAX","SFO","BOS","EWR"], intl: true },
};
const AIRLINE_WORDS = { united: "UA", american: "AA", delta: "DL", southwest: "WN", jetblue: "B6", alaska: "AS", spirit: "NK", frontier: "F9", hawaiian: "HA", british: "BA", lufthansa: "LH", airfrance: "AF", jal: "JL", aircanada: "AC" };
const DEST_POOL = ["LAS","MCO","EWR","PHX","IAH","MSP","DCA","AUS","SAN","HNL","CLT","DTW","PHL","SLC","FLL","BWI","MDW","SFO","ORD","ATL","DEN","LAX","JFK","SEA","DFW","BOS","MIA"];
const INTL_POOL = ["LHR","CDG","NRT","MEX","YYZ"];

/* Demo departures shown on the home board. Offsets are minutes from now,
   so the board is always live no matter when the page is opened. */
const DEMO = [
  { ident: "UA1523", origin: "SFO", dest: "ORD", offset: 130, gate: "F11", delay: 0 },
  { ident: "DL402",  origin: "JFK", dest: "LAX", offset: 65,  gate: "B24", delay: 35 },
  { ident: "AA2716", origin: "ORD", dest: "DFW", offset: 220, gate: "K5",  delay: 0 },
  { ident: "WN1188", origin: "DEN", dest: "LAS", offset: 34,  gate: "C38", delay: 0 },
  { ident: "AS21",   origin: "SEA", dest: "SFO", offset: 260, gate: "N12", delay: 0 },
  { ident: "B6915",  origin: "BOS", dest: "SFO", offset: 100, gate: "C25", delay: 12 },
  { ident: "DL1247", origin: "ATL", dest: "MCO", offset: 170, gate: "A10", delay: 0 },
  { ident: "BA286",  origin: "SFO", dest: "LHR", offset: 195, gate: "A8",  delay: 0 },
];

/* How you get to the airport. Each mode adds its own steps between the
   curb and the checkpoint, and a reminder specific to that mode. */
const MODES = {
  drop:    { label: "Drop-off / rideshare", short: "Drop-off", extra: [], hint: "Request the car 5 min before you need to leave." },
  park:    { label: "Drive and park",       short: "Park",     extra: [{ k: "park", min: 12, title: "Park and reach the terminal", desc: "12 min · garage or shuttle to the terminal" }], hint: "Economy lots add 10 to 15 min more; reserve a spot if the airport offers it." },
  transit: { label: "Train or bus",         short: "Transit",  extra: [{ k: "station", min: 6, title: "Station to the terminal", desc: "6 min · platform to the terminal door" }], hint: "Transit runs on a timetable: take the departure before the one that just fits." },
};

/* ============================================================
   Utilities
   ============================================================ */
const MIN = 60000;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function rand(seed) { let t = seed + 0x6D2B79F5; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }
/* Smooth value noise over 10-minute buckets so live numbers drift instead of jumping. */
function noise(key, t, bucketMin = 10) {
  const b = t / (bucketMin * MIN); const i = Math.floor(b); const f = b - i; const s = f * f * (3 - 2 * f);
  const a = rand(hash(key + ":" + i)), c = rand(hash(key + ":" + (i + 1)));
  return a + (c - a) * s;
}
function tzParts(d, tz) {
  const p = new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", minute: "numeric", hour12: false, weekday: "short", timeZoneName: "short" }).formatToParts(d);
  const g = t => (p.find(x => x.type === t) || {}).value;
  return { hour: (+g("hour") % 24) + (+g("minute")) / 60, dow: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].indexOf(g("weekday")), abbr: g("timeZoneName") };
}
function fmtTime(d, tz) { return new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", minute: "2-digit" }).format(d); }
function fmtTimeParts(d, tz) { const s = fmtTime(d, tz); const m = s.match(/^(.*?)\s*(AM|PM)$/i); return m ? { t: m[1], ap: m[2] } : { t: s, ap: "" }; }
function fmtDur(min) { min = Math.round(min); if (min < 60) return `${min} min`; const h = Math.floor(min / 60), m = min % 60; return m ? `${h} h ${m} min` : `${h} h`; }
function fmtRel(ms) { const m = Math.round(ms / MIN); if (Math.abs(m) < 1) return "now"; return m > 0 ? `in ${fmtDur(m)}` : `${fmtDur(-m)} ago`; }
function dateStr(d, tz) { return new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(d); }

function parseIdent(q) {
  let s = String(q || "").trim().toLowerCase().replace(/\s+/g, "");
  for (const [w, code] of Object.entries(AIRLINE_WORDS)) if (s.startsWith(w)) { s = code.toLowerCase() + s.slice(w.length); break; }
  const m = s.toUpperCase().match(/^([A-Z0-9]{2})\s*0*(\d{1,4})[A-Z]?$/);
  return m ? m[1] + m[2] : null;
}
function gateConcourse(code, gate) {
  const ap = AIRPORTS[code]; if (!ap || !gate) return null;
  const g = String(gate).toUpperCase();
  if (ap.numeric) { const n = parseInt(g, 10); if (!isNaN(n)) { const r = ap.numeric.find(([a, b]) => n >= a && n <= b); return r ? r[2] : null; } }
  const m = g.match(/^([A-Z]+)/); return m ? m[1] : null;
}
const isIntlDest = dest => !!(dest && AIRPORTS[dest]) && !AIRPORTS[dest].tz.startsWith("America") && AIRPORTS[dest].tz !== "Pacific/Honolulu";

/* ============================================================
   Simulation (used whenever no live provider answers)
   ============================================================ */
function curveAt(h, profile) {
  const peaks = profile === "leisure" ? [[6, 1.0, 1.4], [11, .6, 2], [16, .7, 2.2]]
    : profile === "intl" ? [[6.5, .6, 1.5], [12, .6, 2], [17.5, 1.0, 2.2], [21, .5, 1.5]]
    : [[6.5, 1.0, 1.3], [11.5, .6, 2], [16.5, .85, 2]];
  let v = .12; for (const [c, a, w] of peaks) v += a * Math.exp(-((h - c) ** 2) / (2 * w * w)); return v;
}
const DOW = [1.1, 1.15, .9, .9, 1.15, 1.1, .85];
function simLaneWait(code, cp, when, lane, withNoise = true, spike = 1) {
  const ap = AIRPORTS[code]; const { hour, dow } = tzParts(when, ap.tz);
  if (hour < cp.hours[0] || hour >= cp.hours[1]) return null;
  let std = ap.base * cp.f * curveAt(hour, ap.profile) * DOW[dow] * spike;
  if (withNoise) std *= .75 + .5 * noise(cp.id, when.getTime());
  std = Math.max(2, std);
  if (lane === "pre") return Math.max(2, std * .35 + 1);
  if (lane === "clear") return Math.max(1, std * .22 + 1);
  return std;
}
/* overrides.spike multiplies every wait at the airport (demo control). */
function simWaits(code, when = new Date(), overrides) {
  overrides = overrides || {};
  const ap = AIRPORTS[code]; const spike = overrides.spike || 1;
  return {
    airport: code, updated: when.getTime() - Math.round(rand(hash(code + Math.floor(when / (5 * MIN)))) * 4 * MIN), source: "demo",
    granularity: "checkpoint",
    checkpoints: ap.checkpoints.map(cp => {
      const lanes = {}; for (const l of ["std", "pre", "clear"]) {
        if (!cp.lanes.includes(l)) { lanes[l] = null; continue; }
        const now = simLaneWait(code, cp, when, l, true, spike), prev = simLaneWait(code, cp, new Date(when - 15 * MIN), l, true, spike);
        lanes[l] = now == null ? null : { min: Math.round(now), trend: prev == null ? 0 : Math.sign(Math.round(now) - Math.round(prev)) };
      }
      return { id: cp.id, open: lanes.std !== null || lanes.pre !== null, lanes };
    }),
  };
}

/* overrides: { delay: extra minutes, gateBump: gate number shift } (demo controls). */
function simFlight(ident, day = "today", now = Date.now(), overrides) {
  overrides = overrides || {};
  const demo = DEMO.find(d => d.ident === ident);
  const code = ident.slice(0, 2), num = ident.slice(2);
  const al = AIRLINES[code] || { name: code + " Airlines", hubs: ORIGINS };
  const seed = hash(ident);
  const origin = demo ? demo.origin : al.hubs[seed % al.hubs.length];
  const intl = !demo && al.intl && rand(seed + 3) < .25;
  let dest = demo ? demo.dest : (intl ? INTL_POOL[seed % INTL_POOL.length] : DEST_POOL[(seed >> 3) % DEST_POOL.length]);
  if (dest === origin) dest = origin === "DEN" ? "SFO" : "DEN";
  const ap = AIRPORTS[origin];
  const base = demo ? demo.offset : 45 + Math.floor(rand(seed + 1) * 330);
  const sched = new Date(Math.round((now + base * MIN) / (5 * MIN)) * 5 * MIN + (day === "tomorrow" ? 24 * 60 * MIN : 0));
  let delay = demo ? demo.delay : (rand(seed + 2) < .3 ? 10 + Math.floor(rand(seed + 4) * 50) : 0);
  if (delay) delay += Math.round(noise(ident + ":drift", now, 20) * 10 - 5);
  delay = Math.max(0, delay) + (overrides.delay || 0);
  const est = new Date(sched.getTime() + delay * MIN);
  const cps = ap.checkpoints; const cpSeed = cps[seed % cps.length];
  let gate = demo ? demo.gate : null;
  if (!gate) {
    const cons = Object.keys(cpSeed.walk); const con = cons[(seed >> 5) % cons.length];
    gate = ap.numeric ? String((ap.numeric.find(r => r[2] === con) || [1])[0] + 1 + (seed % 8)) : con + (1 + (seed % 30));
  }
  let gateChanged = false;
  const bump = (overrides.gateBump || 0) + ((!demo && rand(seed + 7) < .2 && est - now < 90 * MIN) ? 4 : 0);
  if (bump) { const m = gate.match(/^([A-Z]*)(\d+)$/); if (m) { gate = m[1] + (+m[2] + bump); gateChanged = true; } }
  const cp = cps.find(c => c.walk[gateConcourse(origin, gate)]) || cps[0];
  const toDep = est - now;
  const international = isIntlDest(dest);
  const boardingLead = al.boarding || (international ? 60 : 40);
  let status;
  if (toDep < -5 * MIN) status = "Departed";
  else if (toDep < 15 * MIN) status = "Final call";
  else if (toDep < boardingLead * MIN) status = "Boarding";
  else if (delay > 0) status = "Delayed";
  else status = "On time";
  return {
    ident, airline: { code, name: al.name }, number: num, status, source: "demo", international,
    boardingLead, doorClose: international ? 20 : 15, bagCutoff: international ? 60 : 45,
    departure: { airport: origin, terminal: cp.terminal, gate, scheduled: sched.toISOString(), estimated: est.toISOString(), delay, gateChanged },
    arrival: { airport: dest, scheduled: new Date(sched.getTime() + (international ? 620 : 150 + (seed % 200)) * MIN).toISOString() },
    aircraft: ["Boeing 737-900", "Airbus A321neo", "Boeing 787-9", "Airbus A320", "Boeing 737 MAX 8", "Embraer 175"][seed % 6],
    fetched: now,
  };
}

/* Normalise a live provider's flight into the simulated shape. */
function normalizeFlight(f) {
  const dest = f.arrival && f.arrival.airport;
  const international = isIntlDest(dest) || !!f.international;
  const al = AIRLINES[f.ident.slice(0, 2)] || {};
  return Object.assign({ boardingLead: al.boarding || (international ? 60 : 40), doorClose: international ? 20 : 15, bagCutoff: international ? 60 : 45, international }, f,
    { departure: Object.assign({ delay: Math.max(0, Math.round((new Date(f.departure.estimated || f.departure.scheduled) - new Date(f.departure.scheduled)) / MIN)) }, f.departure) });
}
/* Live feeds rarely name every checkpoint the way the airport does; match
   by normalized name, and fall back to an airport-wide number when that is
   all the provider gives. */
function mergeWaits(code, w, sim) {
  const norm = s => String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const out = { airport: code, updated: w.updated || Date.now(), source: w.source || "live", granularity: w.granularity || "checkpoint", checkpoints: [] };
  for (const s of sim.checkpoints) {
    const cp = AIRPORTS[code].checkpoints.find(c => c.id === s.id);
    const m = w.checkpoints.find(x => x.id === s.id || (x.name && (norm(x.name) === norm(cp.name) || norm(cp.name).includes(norm(x.name)) || norm(x.name).includes(norm(cp.name.split("·")[0]))))) || (w.granularity === "airport" ? w.checkpoints[0] : null);
    if (!m) { out.checkpoints.push(Object.assign({}, s, { estimated: true })); continue; }
    const lanes = {};
    for (const l of ["std", "pre", "clear"]) { const v = m.lanes && m.lanes[l]; lanes[l] = !cp.lanes.includes(l) ? null : v == null ? (s.lanes[l] ? Object.assign({}, s.lanes[l], { estimated: true }) : null) : { min: Math.round(v.min), trend: v.trend || 0 }; }
    out.checkpoints.push({ id: s.id, open: m.open !== false, lanes });
  }
  return out;
}

/* ============================================================
   The bridge: flight + live waits + your prefs -> a plan
   ============================================================ */
const CURB = 8, BAGDROP = 12;
const laneName = l => ({ std: "standard", pre: "TSA PreCheck", clear: "CLEAR" }[l] || "standard");
const laneShort = l => ({ std: "Standard", pre: "PreCheck", clear: "CLEAR" }[l] || "Standard");

/* Wait expected at a later arrival: today's typical curve at that time,
   scaled by how far the live reading sits from typical right now. */
function forecastWait(code, cp, lane, at, nowWait, now = new Date()) {
  const typAt = simLaneWait(code, cp, at, lane, false);
  if (typAt == null) return null;
  const typNow = simLaneWait(code, cp, now, lane, false);
  if (nowWait == null || typNow == null || typNow < 2) return typAt;
  return typAt * clamp(nowWait / typNow, .6, 1.6);
}

function computePlan(flight, waits, p, forcedCp, now = Date.now()) {
  const code = flight.departure.airport; const ap = AIRPORTS[code];
  const mode = MODES[p.mode] || MODES.drop;
  const extraMin = mode.extra.reduce((a, e) => a + e.min, 0);
  const groundMin = p.travel + CURB + extraMin + (p.bag ? BAGDROP : 0);
  const dep = new Date(flight.departure.estimated || flight.departure.scheduled);
  const boarding = new Date(dep - flight.boardingLead * MIN);
  const doorClose = new Date(dep - flight.doorClose * MIN);
  const con = gateConcourse(code, flight.departure.gate);
  const lane = p.lane;
  const options = ap.checkpoints.map(cp => {
    const w = waits.checkpoints.find(x => x.id === cp.id) || { open: false, lanes: {} };
    const laneUsed = lane === "clear" ? (cp.lanes.includes("clear") ? "clear" : cp.lanes.includes("pre") ? "pre" : "std") : lane === "pre" ? (cp.lanes.includes("pre") ? "pre" : "std") : "std";
    const nowWait = w.open && w.lanes[laneUsed] ? w.lanes[laneUsed].min : null;
    const walk = con && cp.walk[con] != null ? cp.walk[con] : (Math.max(...Object.values(cp.walk)) + 6);
    const sameTerminal = con ? cp.walk[con] != null : cp.terminal === flight.departure.terminal;
    // When will you actually reach this checkpoint? The later of "leaving now"
    // and "leaving just in time", using the current wait as a first guess.
    const arrive = new Date(Math.max(now + groundMin * MIN, boarding - (p.buffer + walk + (nowWait == null ? 15 : nowWait)) * MIN));
    let wait = nowWait, predicted = false;
    if (arrive - now > 45 * MIN || nowWait == null) {
      const f = forecastWait(code, cp, laneUsed, arrive, nowWait, new Date(now));
      if (f != null) { wait = Math.round(f); predicted = true; }
      else if (arrive - now > 45 * MIN) wait = null;
    }
    return { cp, w, laneUsed, wait, nowWait, arrive, predicted, walk, sameTerminal, open: wait != null, total: wait == null ? Infinity : wait + walk, estimated: !!(w.lanes[laneUsed] && w.lanes[laneUsed].estimated) };
  }).sort((a, b) => a.total - b.total || a.walk - b.walk);
  const rec = options.find(o => o.open) || options[0];
  const chosen = (forcedCp && options.find(o => o.cp.id === forcedCp && o.open)) || rec;
  const wait = chosen.wait == null ? 20 : chosen.wait, walk = chosen.walk;

  // Backward from boarding: when must each step begin?
  const atGate = new Date(boarding - p.buffer * MIN);
  const throughSec = new Date(atGate - walk * MIN);
  const atCheckpoint = new Date(throughSec - wait * MIN);
  const atBagDrop = p.bag ? new Date(atCheckpoint - BAGDROP * MIN) : null;
  const atCurb = new Date((atBagDrop || atCheckpoint) - (CURB + extraMin) * MIN);
  let leaveBy = new Date(atCurb - p.travel * MIN);
  const bagCutoff = p.bag ? new Date(dep - flight.bagCutoff * MIN) : null;
  let binding = "gate";
  if (bagCutoff && atBagDrop > bagCutoff) { const shift = atBagDrop - bagCutoff; leaveBy = new Date(leaveBy - shift); binding = "bag"; }

  const slackMin = (leaveBy - now) / MIN;
  const gateIfNow = now + (groundMin + wait + walk) * MIN;
  let state, headline, detail;
  if (flight.status === "Departed" || flight.status === "Cancelled") { state = "past"; headline = flight.status; detail = flight.status === "Departed" ? "This flight has already left the gate." : "This flight is cancelled. Talk to the airline about rebooking."; }
  else if (slackMin >= 20) { state = "good"; headline = "On track"; detail = `Leave in ${fmtDur(slackMin)} and you'll be at the gate ${p.buffer} min before boarding.`; }
  else if (slackMin >= 0) { state = "warn"; headline = "Tight"; detail = `Only ${fmtDur(slackMin)} until you need to leave. Get ready now.`; }
  else if (gateIfNow <= doorClose - 2 * MIN) { state = "warn"; headline = "Leave now"; detail = `Leaving this minute, you reach ${flight.departure.gate ? "gate " + flight.departure.gate : "the gate"} ${fmtDur((doorClose - gateIfNow) / MIN)} before the door closes. No buffer left.`; }
  else { state = "bad"; headline = "Likely missed"; detail = `Even leaving now, you'd reach the gate about ${fmtDur((gateIfNow - doorClose) / MIN)} after the door closes. Call the airline to rebook.`; }
  // Leaving late with a bag: the counter can close before the door does.
  const bagArrive = p.bag ? now + (p.travel + CURB + extraMin) * MIN : null;
  if (state !== "past" && p.bag && slackMin < 0 && bagArrive > bagCutoff) {
    binding = "bag";
    if (state !== "bad") { state = "bad"; headline = "Bag cutoff missed"; }
    detail = `Leaving now, you reach bag drop ${fmtDur((bagArrive - bagCutoff) / MIN)} after counters close at ${fmtTime(bagCutoff, ap.tz)}.` + (gateIfNow <= doorClose - 2 * MIN ? ` You can still make the gate with carry-on only.` : ` The gate is out of reach too. Call the airline to rebook.`);
  } else if (state !== "past" && binding === "bag") detail += ` Bag drop closes at ${fmtTime(bagCutoff, ap.tz)}, which is what sets this time.`;

  // Smart tip: would leaving earlier dodge a security peak?
  let tip = null;
  if (state === "good" && chosen.open) {
    const arriveCp = new Date(leaveBy.getTime() + (p.travel + CURB + extraMin + (p.bag ? BAGDROP : 0)) * MIN);
    for (const earlier of [30, 60]) {
      const alt = forecastWait(code, chosen.cp, chosen.laneUsed, new Date(arriveCp - earlier * MIN), chosen.nowWait, new Date(now));
      if (alt != null && wait - alt >= 10 && (leaveBy - earlier * MIN) > now + 5 * MIN) { tip = { earlier, saves: Math.round(wait - alt), wait: Math.round(alt) }; break; }
    }
  }

  // Forward timeline for the step list.
  const start = slackMin >= 0 ? leaveBy : new Date(now);
  let t = start.getTime(); const steps = [];
  const push = (title, at, desc, kind) => steps.push({ title, at: new Date(at), desc, kind });
  push("Leave for " + code, t, `${p.travel} min · ${mode.label.toLowerCase()}`, "leave");
  t += p.travel * MIN;
  push("Arrive at the airport", t, mode.extra.length ? mode.extra[0].desc : `${CURB} min from the curb to the checkpoint`, "curb");
  for (const e of mode.extra) t += e.min * MIN;
  if (mode.extra.length) push("At the terminal", t, `${CURB} min from the door to the checkpoint`, "curb");
  if (p.bag) { push("Drop your bag", t, `${BAGDROP} min · counters close ${fmtTime(bagCutoff, ap.tz)}`, "bag"); t += BAGDROP * MIN; }
  t += CURB * MIN;
  push("Join " + chosen.cp.name.split(" · ").pop(), t, chosen.predicted ? `~${wait} min ${laneName(chosen.laneUsed)} wait expected at ${fmtTime(new Date(t), ap.tz)}` + (chosen.nowWait != null ? ` · ${chosen.nowWait} min now` : " · closed now") : `${wait} min ${laneName(chosen.laneUsed)} wait`, chosen.predicted ? "forecast" : "wait");
  t += wait * MIN; push("Through security", t, `${walk} min walk to ${flight.departure.gate ? "gate " + flight.departure.gate : "the gate"}`, "walk");
  t += walk * MIN; push("At the gate", t, slackMin >= 0 ? `${fmtDur((boarding - t) / MIN)} of buffer before boarding` : (t <= doorClose ? `${fmtDur((doorClose - t) / MIN)} before the door closes` : `${fmtDur((t - doorClose) / MIN)} after the door closed`), "gate");
  push("Boarding begins", boarding, `${flight.boardingLead} min before departure`, "hard");
  push("Door closes", doorClose, `${flight.doorClose} min before departure`, "hard");
  push("Departs", dep, flight.departure.delay ? `${flight.departure.delay} min behind schedule` : "on schedule", "hard");

  const segs = [
    { k: "travel", min: p.travel, label: "travel" },
    ...mode.extra.map(e => ({ k: "curb", min: e.min, label: e.k })),
    { k: "curb", min: CURB, label: "curb" },
    ...(p.bag ? [{ k: "bag", min: BAGDROP, label: "bag" }] : []),
    { k: "wait", min: wait, label: "security" }, { k: "walk", min: walk, label: "walk" },
    { k: "buffer", min: Math.max(0, (boarding - (start.getTime() + (groundMin + wait + walk) * MIN)) / MIN), label: "buffer" },
    { k: "boarding", min: (doorClose - boarding) / MIN, label: "boarding" }, { k: "close", min: flight.doorClose, label: "door" },
  ];
  return { state, headline, detail, tip, leaveBy, slackMin, atCheckpoint, boarding, doorClose, dep, chosen, rec, options, steps, segs, start, wait, walk, lane: chosen.laneUsed, binding, bagCutoff, mode };
}

root.Leaveby = { AIRPORTS, ORIGINS, AIRLINES, DEMO, MODES, MIN, CURB, BAGDROP, clamp, hash, rand, noise, tzParts, fmtTime, fmtTimeParts, fmtDur, fmtRel, dateStr, parseIdent, gateConcourse, isIntlDest, simLaneWait, simWaits, simFlight, normalizeFlight, mergeWaits, forecastWait, computePlan, laneName, laneShort };
})(typeof window !== "undefined" ? window : globalThis);
