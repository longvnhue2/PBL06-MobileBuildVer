import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Text as SvgText, Defs, LinearGradient, Stop } from "react-native-svg";

const GradientText = ({ text, colors, fontSize = 36 }) => {
  return (
    <Svg height={fontSize * 1.5} width="100%">
      <Defs>
        <LinearGradient id="gradient" x1="0" y1="0" x2="1" y2="0">
          {colors.map((color, index) => (
            <Stop key={index} offset={`${(index / (colors.length - 1)) * 100}%`} stopColor={color} />
          ))}
        </LinearGradient>
      </Defs>
      <SvgText
        fill="url(#gradient)"
        fontSize={fontSize}
        fontWeight="bold"
        x="50%"
        y="50%"
        textAnchor="middle"
        alignmentBaseline="middle"
      >
        {text}
      </SvgText>
    </Svg>
  );
};

export default GradientText;
