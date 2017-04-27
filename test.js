function mapping(name) {
  mapping = {
    "Hillary Clinton" = "P00003392",
    "Donald Trump" = "P80001571",
    "Berny Sanders" = "P60007168",
    "Ted Cruz" = "P60006111"
  }
  return(mapping[name])
}

console.log(mapping["Ted Cruz"])

