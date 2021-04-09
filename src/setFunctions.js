const setMath = {
  isSuperset: (set, subset) => {
      for (let elem of subset) {
          if (!set.has(elem)) {
              return false
          }
      }
      return true
  },

  union: (setA, setB) => {
      let _union = new Set(setA)
      for (let elem of setB) {
          _union.add(elem)
      }
      return _union
  },

  intersection: (setA, setB) => {
      let _intersection = new Set()
      let tempA=setA;
      setA=setA.size>setB.size?setA:setB
      setB=setA.size>setB.size?setB:tempA
      for (let elem of setB) {
          if (setA.has(elem)) {
              _intersection.add(elem)
          }
      }
      return _intersection
  },

  symmetricDifference: (setA, setB) => {
      let _difference = new Set(setA)
      for (let elem of setB) {
          if (_difference.has(elem)) {
              _difference.delete(elem)
          } else {
              _difference.add(elem)
          }
      }
      return _difference
  },

  difference: (setA, setB) => {
      let _difference = new Set(setA)
      for (let elem of setB) {
          _difference.delete(elem)
      }
      return _difference
  }
}

export default setMath;