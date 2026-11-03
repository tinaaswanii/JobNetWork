import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { filtersFromParams, locationFilter } from "../lib/jobs-query.ts";

const sp = (q) => new URLSearchParams(q);

describe("default jobs location", () => {
  it("defaults to India when no location is given", () => {
    assert.equal(filtersFromParams(sp("")).location, "India");
  });
  it("keeps an explicit location and lets 'all' mean worldwide", () => {
    assert.equal(filtersFromParams(sp("location=Pune")).location, "Pune");
    assert.equal(filtersFromParams(sp("location=all")).location, "");
  });
  it("India also matches Artha's country code", () => {
    const f = locationFilter("India");
    assert.match(f, /country\.eq\.IN/);
    assert.equal(locationFilter("  "), null);
    assert.doesNotMatch(locationFilter("Pune"), /country\.eq\.IN/);
  });
});
