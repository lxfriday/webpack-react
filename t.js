function f() {
  console.log(arguments)
}

const f1 = () => {
  console.log(arguments)
}

const f2 = (...args) => {
  console.log(args)
}

const info = [1, 2, 3, 4]

f(...info)
f1(...info)
f2(...info)

console.log(arguments)
