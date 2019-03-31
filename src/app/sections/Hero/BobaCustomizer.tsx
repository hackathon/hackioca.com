import React, { useEffect, useState, useRef } from "react";
import styled from "styled-components";
import ReactTooltip from "react-tooltip";
import { useQueryParams, StringParam } from "use-query-params";
import { getScrollbarWidth } from "src/utils/scroll-bar-width";

import media from "src/utils/media";
import copy from "src/copy";
import { flavors, toppings, Flavor, Topping } from "src/data";
import { useBobaContext } from "src/utils/context/boba";

import BobaDisplay from "./BobaDisplay";
import OptionPicker from "./OptionPicker";

/* HELPERS */
type ToppingOrFlavor = Topping | Flavor;

const circleBgColors = {
  mango: "#F8E399",
  milk: "#F2E1CF",
  matcha: "#E3E8B7",
  taro: "#E7C8D8",
  strawberry: "#F6B7B7"
};

const isTopping = (option: ToppingOrFlavor): option is Topping =>
  toppings.indexOf(option as Topping) >= 0;

const isFlavor = (option: ToppingOrFlavor): option is Flavor =>
  flavors.indexOf(option as Flavor) >= 0;

// https://stackoverflow.com/questions/50924952/typescript-has-no-compatible-call-signatures
// Since the picker only displays 3 options for each, find the range of -1, +1 options based
// on the currently selected option
const filterShownOptions = (selected: ToppingOrFlavor): ToppingOrFlavor[] => {
  // Deep copy the array of options
  let resultArr: ToppingOrFlavor[] = isTopping(selected)
    ? [...toppings]
    : [...flavors];
  const posInArr = resultArr.indexOf(selected);

  if (posInArr === 0) {
    // Merge array of last item with first two items in options
    resultArr = resultArr
      .slice(resultArr.length - 1, resultArr.length)
      .concat(resultArr.slice(0, 2));
  } else if (posInArr === resultArr.length - 1) {
    // Merge last two items with first item in options
    resultArr = resultArr
      .slice(resultArr.length - 2, resultArr.length)
      .concat(resultArr.slice(0, 1));
  } else {
    // Get item before, item after, and current item in options
    resultArr = resultArr.slice(posInArr - 1, posInArr + 2);
  }

  return resultArr;
};

// Changes the selected option by shiftBy units in the original
// toppings or flavors array
const shiftOptionBy = (selected: ToppingOrFlavor, shiftBy: number) => {
  // Shift index by shiftBy places
  let newIndex =
    (isTopping(selected)
      ? toppings.indexOf(selected as Topping)
      : flavors.indexOf(selected as Flavor)) + shiftBy;

  // Take module to bound index by options array size
  // https://stackoverflow.com/questions/4467539/javascript-modulo-gives-a-negative-result-for-negative-numbers
  newIndex = ((newIndex % toppings.length) + toppings.length) % toppings.length;

  // Return the correct type
  return isTopping(selected) ? toppings[newIndex] : flavors[newIndex];
};

/* STYLED COMPONENTS */
const Container = styled.div<{ circleColor: string }>`
  width: 550px;
  height: 375px;
  position: relative;

  margin: auto;

  display: flex;
  justify-content: space-between;

  & div.circleBg {
    width: 300px;
    height: 300px;
    bottom: 10px;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);

    transition: background-color 500ms ease-out;
    background-color: ${props => props.circleColor};
    border-radius: 50%;
  }

  ${media.phone`
    width: calc(100vw - ${getScrollbarWidth()}px);
    height: auto;

    & div.circleBg {
      width: 250px;
      height: 250px;
      bottom: 30px;
    }
  `}
`;

/* MAIN COMPONENT */
const BobaCustomizer: React.FC = () => {
  const {
    flavor: selectedFlavor,
    topping: selectedTopping,
    updateFlavor,
    updateTopping
  } = useBobaContext();
  const [query, setQuery] = useQueryParams({
    flavor: StringParam,
    topping: StringParam
  });
  const { flavor: paramFlavor, topping: paramTopping } = query;
  const [userInteracted, updateUserInteracted] = useState(false);
  const [boopChanged, updateBoopChanged] = useState(false);
  const shownFlavors = filterShownOptions(selectedFlavor) as Flavor[];
  const shownToppings = filterShownOptions(selectedTopping) as Topping[];
  const switcherRef = useRef(null);


  const nextTopping = () => changeTopping(shiftOptionBy(selectedTopping, 1) as Topping, false);
  const prevTopping = () => changeTopping(shiftOptionBy(selectedTopping, -1) as Topping, false);
  const changeTopping = (topping: Topping, fromParam: boolean) => {
    if (topping !== selectedTopping) {
      updateUserInteracted(true);
    }
    if(fromParam) {
      updateTopping(topping);
    }
    if (switcherRef.current) (switcherRef.current as any).slickGoTo(toppings.indexOf(topping));
  };
  const nextFlavor = () => changeFlavor(shiftOptionBy(selectedFlavor, 1) as Flavor);
  const prevFlavor = () => changeFlavor(shiftOptionBy(selectedFlavor, -1) as Flavor);
  const changeFlavor = (flavor: Flavor) => {
    if (flavor !== selectedFlavor) updateUserInteracted(true);
    updateFlavor(flavor);
  };
  

  // Read the url params and update boba options if necessary
  useEffect(() => {
    if (
      paramFlavor &&
      isFlavor(paramFlavor as Flavor) &&
      paramFlavor !== selectedFlavor
    )
      changeFlavor(paramFlavor as Flavor);
    if (
      paramTopping &&
      isTopping(paramTopping as Topping) &&
      paramTopping !== selectedTopping
    )
      changeTopping(paramTopping as Topping, true);
  }, []);

  // Randomly change flavor every 3 secs until user interaction occurs
  // If user interacted, then trigger the boop animation
  useEffect(() => {
    if (!userInteracted) {
      const flavorChangerId = setInterval(
        () => updateFlavor(shiftOptionBy(selectedFlavor, 1) as Flavor),
        3000
      );
      return () => clearTimeout(flavorChangerId);
    } else {
      updateBoopChanged(true);
    }

    return () => { };
  }, [userInteracted, selectedFlavor]);

  // Update the url params if user changes options
  useEffect(() => {
    if (userInteracted) {
      setQuery({
        flavor: selectedFlavor,
        topping: selectedTopping
      });
    }
  }, [userInteracted, selectedFlavor, selectedTopping]);

  // Update the tooltips after flavor/topping selection changed
  useEffect(() => ReactTooltip.rebuild(), [selectedFlavor, selectedTopping]);

  return (
    <Container
      className="optionPicker"
      circleColor={circleBgColors[selectedFlavor]}
    >
      <OptionPicker
        incrementOption={nextFlavor}
        decrementOption={prevFlavor}
        changeOption={changeFlavor}
        shownOptions={shownFlavors}
        selectedOption={selectedFlavor}
        tooltipOptions={copy.hero.flavors}
      />

      <div className="circleBg" />

      <BobaDisplay
        switcherRef={switcherRef}
        boopChanged={boopChanged}
        animationEndCallback={() => updateBoopChanged(false)}
        selectedFlavor={selectedFlavor}
        selectedTopping={selectedTopping}
        updateTopping={updateTopping}
        prevTopping={prevTopping}
        nextTopping={nextTopping}
        nextFlavor={nextFlavor}
      />

      <OptionPicker
        incrementOption={nextTopping}
        decrementOption={prevTopping}
        changeOption={(topping: Topping) => changeTopping(topping, false)}
        shownOptions={shownToppings}
        selectedOption={selectedTopping}
        tooltipOptions={copy.hero.toppings}
      />
    </Container>
  );
};

export default BobaCustomizer;
