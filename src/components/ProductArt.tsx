import React from 'react';
import { Image, View } from 'react-native';
import Svg, {
  Path,
  Rect,
  Circle,
  Ellipse,
  Text as SvgText,
  G,
} from 'react-native-svg';
const photos: Record<string, any> = {
  pizza: require('../../assets/products/pizza.jpg'),
  wings: require('../../assets/products/wings.jpg'),
  icecream: require('../../assets/products/icecream.jpg'),
  chocolate: require('../../assets/products/icecream.jpg'),
};
export function ProductArt({
  kind,
  size = 130,
}: {
  kind: string;
  size?: number;
}) {
  if (photos[kind])
    return (
      <Image
        source={photos[kind]}
        style={{ width: size, height: size, borderRadius: 14 }}
        resizeMode="cover"
      />
    );
  const cup = kind === 'slurpee' || kind === 'coffee';
  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Svg width={size} height={size} viewBox="0 0 160 160">
        <Ellipse cx="80" cy="143" rx="43" ry="7" fill="#000" opacity="0.07" />
        {cup ? (
          <G rotation={kind === 'slurpee' ? -8 : 7} origin="80,80">
            <Path
              d="M99 14L91 65"
              stroke={kind === 'slurpee' ? '#DA433B' : '#007C54'}
              strokeWidth="7"
            />
            <Path
              d="M45 47Q80 29 115 47L104 139Q80 149 56 139Z"
              fill={kind === 'slurpee' ? '#F03F48' : '#BA8052'}
            />
            <Ellipse
              cx="80"
              cy="48"
              rx="35"
              ry="10"
              fill={kind === 'slurpee' ? '#FF7880' : '#DBB28E'}
            />
            <Path
              d="M49 60L111 60L107 108Q78 117 53 108Z"
              fill={kind === 'slurpee' ? '#fff' : '#FFF3DB'}
            />
            <SvgText
              x="80"
              y="91"
              fill={kind === 'slurpee' ? '#C42A35' : '#007951'}
              textAnchor="middle"
              fontSize="20"
              fontWeight="900"
            >
              {kind === 'slurpee' ? 'Slurpee' : '7 CAFÉ'}
            </SvgText>
          </G>
        ) : kind === 'water' ? (
          <G>
            <Rect x="67" y="14" width="26" height="17" rx="4" fill="#0B8265" />
            <Path
              d="M66 31L94 31L108 52L108 131Q80 148 52 131L52 52Z"
              fill="#BFE7E0"
            />
            <Path d="M52 65H108V114H52Z" fill="#F6FFFA" />
            <Circle cx="80" cy="86" r="17" fill="#CEEE4C" />
            <SvgText
              x="80"
              y="89"
              textAnchor="middle"
              fontSize="10"
              fontWeight="800"
              fill="#08795A"
            >
              LIME
            </SvgText>
          </G>
        ) : kind === 'chips' ? (
          <G rotation="-8" origin="80,80">
            <Path d="M43 22L114 22L121 141L37 141Z" fill="#F5BB40" />
            <Path d="M43 22L114 22V34H42Z" fill="#EAA629" />
            <Ellipse cx="81" cy="79" rx="29" ry="35" fill="#FFF4D1" />
            <SvgText
              x="80"
              y="73"
              textAnchor="middle"
              fontSize="13"
              fontWeight="900"
              fill="#0B694B"
            >
              KETTLE
            </SvgText>
            <SvgText
              x="80"
              y="90"
              textAnchor="middle"
              fontSize="16"
              fontWeight="900"
              fill="#0B694B"
            >
              CHIPS
            </SvgText>
            <SvgText
              x="80"
              y="125"
              textAnchor="middle"
              fontSize="9"
              fill="#735821"
            >
              SEA SALT
            </SvgText>
          </G>
        ) : kind === 'cookie' ? (
          <G>
            <Circle cx="80" cy="80" r="54" fill="#C78B4E" />
            <Circle cx="80" cy="77" r="49" fill="#E5B273" />
            {[
              [55, 52],
              [94, 48],
              [76, 74],
              [112, 85],
              [52, 97],
              [88, 109],
              [49, 74],
              [97, 74],
            ].map(([x, y], i) => (
              <Rect
                key={i}
                x={x}
                y={y}
                width="12"
                height="11"
                rx="3"
                rotation="22"
                origin={`${x},${y}`}
                fill="#593326"
              />
            ))}
          </G>
        ) : kind === 'milk' ? (
          <G>
            <Path d="M53 48L68 20H99L112 48V139H50V48Z" fill="#F2F7EE" />
            <Path d="M68 20H99L112 48H80Z" fill="#D0E4DC" />
            <Path d="M50 59H112V112H50Z" fill="#137F61" />
            <SvgText
              x="81"
              y="81"
              textAnchor="middle"
              fill="white"
              fontWeight="900"
              fontSize="17"
            >
              MILK
            </SvgText>
            <SvgText
              x="81"
              y="98"
              textAnchor="middle"
              fill="white"
              fontSize="9"
            >
              FRESH & WHOLE
            </SvgText>
          </G>
        ) : kind === 'banana' ? (
          <G rotation="-20" origin="80,80">
            <Path
              d="M37 38Q52 127 126 68Q95 149 44 102Q24 83 28 40Z"
              fill="#F4CD3F"
            />
            <Path
              d="M46 29Q66 111 132 60Q100 133 53 93Q32 76 37 29Z"
              fill="#FFE163"
            />
            <Path d="M36 34L34 20" stroke="#796540" strokeWidth="9" />
          </G>
        ) : (
          <G rotation="-28" origin="80,80">
            <Rect
              x="17"
              y="48"
              width="128"
              height="65"
              rx="30"
              fill="#E7B778"
            />
            <Rect
              x="21"
              y="58"
              width="122"
              height="43"
              rx="22"
              fill="#CC6233"
            />
            <Path
              d="M30 79Q40 62 51 79T73 79T95 79T117 79T133 79"
              stroke="#FFD342"
              strokeWidth="7"
              fill="none"
            />
          </G>
        )}
      </Svg>
    </View>
  );
}
