import React, { useState, createContext, useContext } from "react";
import { Flavor, Topping, flavors, toppings } from "src/data";

export interface BobaState {
  flavor: Flavor;
  topping: Topping;
  updateFlavor: (newFlavor: Flavor) => void;
  updateTopping: (newTopping: Topping) => void;
}

export const BobaContext: React.Context<BobaState> = createContext({
  flavor: flavors[0],
  topping: toppings[0],
  updateFlavor: () => {},
  updateTopping: () => {}
});

export const useBobaContext = () => useContext(BobaContext);

const randomFlavor = flavors[Math.floor(Math.random() * flavors.length)];
const randomTopping = toppings[Math.floor(Math.random() * toppings.length)];

export const BobaProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [flavor, updateFlavor] = useState(randomFlavor);
  const [topping, updateTopping] = useState(randomTopping);

  const bobaState: BobaState = {
    flavor,
    topping,
    updateFlavor,
    updateTopping
  };

  return (
    <BobaContext.Provider value={bobaState}>{children}</BobaContext.Provider>
  );
};
