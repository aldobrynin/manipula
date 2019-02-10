const BenchTable = require("benchtable");
const Manipula = require("../src/index");

const square = x => x * x;
const isEven = x => x % 2 === 0;

const mapFilter = (arr, map, filter) =>
  arr.reduce((current, el) => {
    const mappedEl = map(el);
    if (filter(mappedEl)) current.push(mappedEl);
    return current;
  }, []);

const filterMap = (arr, map, filter) =>
  arr.reduce((current, el) => {
    if (filter(el)) current.push(map(el));
    return current;
  }, []);

function* generatorMap(iterable, func) {
  for (let el of iterable) yield func(el);
}

function* generatorFilter(iterable, func) {
  for (let el of iterable) if (func(el)) yield el;
}

const arraySizes = [100, 1000, 10000, 100000, 1000000];
const getRandomInteger = () => Math.floor(Math.random() * 100);
const inputArrays = arraySizes.map(size => new Array(size).fill(null).map(getRandomInteger));

const createFixture = name => {
  const suite = new BenchTable(name, {
    onComplete: function() {
      console.log(this.name);
      console.log(this.table.toString());
    }
  });
  inputArrays.forEach(array => {
    suite.addInput(`Array of size ${array.length}`, [array]);
  });
  return suite;
};

createFixture("map")
  .addFunction("map", s => s.map(square))
  .addFunction("generator", s => Array.from(generatorMap(s, square)))
  .addFunction("manipula", s =>
    Manipula.from(s)
      .select(square)
      .toArray()
  )
  .run({ async: true });

createFixture("filter")
  .addFunction("filter", s => s.filter(isEven))
  .addFunction("generator", s => Array.from(generatorFilter(s, isEven)))
  .addFunction("manipula", s =>
    Manipula.from(s)
      .where(isEven)
      .toArray()
  )
  .run({ async: true });

createFixture("map and filter")
  .addFunction("map and filter", s => s.map(square).filter(isEven))
  .addFunction("generator", s => Array.from(generatorFilter(generatorMap(s, square), isEven)))
  .addFunction("reduce", s => mapFilter(s, square, isEven))
  .addFunction("manipula", s =>
    Manipula.from(s)
      .select(square)
      .where(isEven)
      .toArray()
  )
  .run({ async: true });

createFixture("filter and map")
  .addFunction("filter and map ", s => s.map(square).filter(isEven))
  .addFunction("generator", s => Array.from(generatorMap(generatorFilter(s, isEven), square)))
  .addFunction("reduce", s => filterMap(s, square, isEven))
  .addFunction("manipula", s =>
    Manipula.from(s)
      .where(isEven)
      .select(square)
      .toArray()
  )
  .run({ async: true });
