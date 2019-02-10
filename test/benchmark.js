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

/*
map
+-----------+-------------------+--------------------+---------------------+----------------------+-----------------------+
|           │ Array of size 100 │ Array of size 1000 │ Array of size 10000 │ Array of size 100000 │ Array of size 1000000 |
+-----------+-------------------+--------------------+---------------------+----------------------+-----------------------+
| map       │ 1,559,892 ops/sec │ 133,278 ops/sec    │ 15,924 ops/sec      │ 793 ops/sec          │ 71.53 ops/sec         |
+-----------+-------------------+--------------------+---------------------+----------------------+-----------------------+
| generator │ 43,779 ops/sec    │ 4,562 ops/sec      │ 466 ops/sec         │ 44.60 ops/sec        │ 3.29 ops/sec          |
+-----------+-------------------+--------------------+---------------------+----------------------+-----------------------+
| manipula  │ 22,864 ops/sec    │ 2,785 ops/sec      │ 284 ops/sec         │ 27.99 ops/sec        │ 2.43 ops/sec          |
+-----------+-------------------+--------------------+---------------------+----------------------+-----------------------+
filter
+-----------+-------------------+--------------------+---------------------+----------------------+-----------------------+
|           │ Array of size 100 │ Array of size 1000 │ Array of size 10000 │ Array of size 100000 │ Array of size 1000000 |
+-----------+-------------------+--------------------+---------------------+----------------------+-----------------------+
| filter    │ 864,058 ops/sec   │ 68,013 ops/sec     │ 7,047 ops/sec       │ 820 ops/sec          │ 36.99 ops/sec         |
+-----------+-------------------+--------------------+---------------------+----------------------+-----------------------+
| generator │ 80,796 ops/sec    │ 7,599 ops/sec      │ 748 ops/sec         │ 77.83 ops/sec        │ 5.94 ops/sec          |
+-----------+-------------------+--------------------+---------------------+----------------------+-----------------------+
| manipula  │ 44,516 ops/sec    │ 4,896 ops/sec      │ 495 ops/sec         │ 45.56 ops/sec        │ 4.02 ops/sec          |
+-----------+-------------------+--------------------+---------------------+----------------------+-----------------------+
filter and map
+-----------------+-------------------+--------------------+---------------------+----------------------+-----------------------+
|                 │ Array of size 100 │ Array of size 1000 │ Array of size 10000 │ Array of size 100000 │ Array of size 1000000 |
+-----------------+-------------------+--------------------+---------------------+----------------------+-----------------------+
| filter and map  │ 530,649 ops/sec   │ 43,755 ops/sec     │ 4,573 ops/sec       │ 373 ops/sec          │ 24.38 ops/sec         |
+-----------------+-------------------+--------------------+---------------------+----------------------+-----------------------+
| generator       │ 63,990 ops/sec    │ 6,144 ops/sec      │ 641 ops/sec         │ 60.92 ops/sec        │ 6.18 ops/sec          |
+-----------------+-------------------+--------------------+---------------------+----------------------+-----------------------+
| reduce          │ 840,642 ops/sec   │ 87,090 ops/sec     │ 7,763 ops/sec       │ 852 ops/sec          │ 35.13 ops/sec         |
+-----------------+-------------------+--------------------+---------------------+----------------------+-----------------------+
| manipula        │ 34,101 ops/sec    │ 4,083 ops/sec      │ 437 ops/sec         │ 41.74 ops/sec        │ 4.17 ops/sec          |
+-----------------+-------------------+--------------------+---------------------+----------------------+-----------------------+
map and filter
+----------------+-------------------+--------------------+---------------------+----------------------+-----------------------+
|                │ Array of size 100 │ Array of size 1000 │ Array of size 10000 │ Array of size 100000 │ Array of size 1000000 |
+----------------+-------------------+--------------------+---------------------+----------------------+-----------------------+
| map and filter │ 518,218 ops/sec   │ 42,959 ops/sec     │ 4,572 ops/sec       │ 381 ops/sec          │ 23.65 ops/sec         |
+----------------+-------------------+--------------------+---------------------+----------------------+-----------------------+
| generator      │ 55,742 ops/sec    │ 5,451 ops/sec      │ 535 ops/sec         │ 53.38 ops/sec        │ 5.25 ops/sec          |
+----------------+-------------------+--------------------+---------------------+----------------------+-----------------------+
| reduce         │ 830,338 ops/sec   │ 78,728 ops/sec     │ 7,295 ops/sec       │ 780 ops/sec          │ 32.79 ops/sec         |
+----------------+-------------------+--------------------+---------------------+----------------------+-----------------------+
| manipula       │ 30,221 ops/sec    │ 3,512 ops/sec      │ 361 ops/sec         │ 31.35 ops/sec        │ 3.45 ops/sec          |
+----------------+-------------------+--------------------+---------------------+----------------------+-----------------------+
*/
