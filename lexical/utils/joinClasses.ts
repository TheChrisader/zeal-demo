const joinClasses = (...classes: (string | undefined | boolean)[]): string => {
  return classes.filter((c) => c).join(" ");
};

export default joinClasses;
