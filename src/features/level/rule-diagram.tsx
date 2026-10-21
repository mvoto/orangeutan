import { useMemo } from 'react';
import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { compactOrangeSvg, grinMonkeySvg, useTheme } from '@/theme';
import { AppText } from '@/ui';

import { oppositeMark, ruleCopy, sameMark } from './rules';
import type { RuleId } from './rules';

type SymbolName = 'monkey' | 'orange';

type RuleDiagramProps = {
  readonly rule: RuleId;
  readonly size: number;
  /** The sheet is one image. A card diagram stays inside the rule button. */
  readonly asImage: boolean;
};

export function RuleDiagram({ rule, size, asImage }: RuleDiagramProps): React.JSX.Element {
  const { spacing } = useTheme();
  const stack = useMemo(() => ({ gap: spacing.xs }), [spacing.xs]);
  const row = useMemo(
    () => ({ flexDirection: 'row' as const, alignItems: 'center' as const, gap: spacing.xs }),
    [spacing.xs],
  );

  return (
    <View
      accessible={asImage}
      accessibilityRole={asImage ? 'image' : undefined}
      accessibilityLabel={asImage ? ruleCopy[rule].diagram : undefined}
      accessibilityElementsHidden={!asImage}
      importantForAccessibility={asImage ? 'auto' : 'no-hide-descendants'}
      style={stack}
    >
      <DiagramBody rule={rule} size={size} row={row} stack={stack} />
    </View>
  );
}

function DiagramBody({
  rule,
  size,
  row,
  stack,
}: {
  readonly rule: RuleId;
  readonly size: number;
  readonly row: { flexDirection: 'row'; alignItems: 'center'; gap: number };
  readonly stack: { gap: number };
}): React.JSX.Element {
  switch (rule) {
    case 'no-three-in-a-row':
      return (
        <>
          <View style={row}>
            <ExampleCell symbol="monkey" size={size} dashed />
            <ExampleCell symbol="monkey" size={size} dashed />
            <ExampleCell symbol="monkey" size={size} dashed />
          </View>
          <View style={stack}>
            <ExampleCell symbol="orange" size={size} dashed />
            <ExampleCell symbol="orange" size={size} dashed />
            <ExampleCell symbol="orange" size={size} dashed />
          </View>
        </>
      );
    case 'balance':
      return (
        <>
          <View style={row}>
            <ExampleCell symbol="monkey" size={size} dashed={false} />
            <ExampleCell symbol="monkey" size={size} dashed={false} />
            <ExampleCell symbol="orange" size={size} dashed={false} />
            <ExampleCell symbol="orange" size={size} dashed={false} />
          </View>
          <View style={stack}>
            <ExampleCell symbol="monkey" size={size} dashed={false} />
            <ExampleCell symbol="monkey" size={size} dashed={false} />
            <ExampleCell symbol="orange" size={size} dashed={false} />
            <ExampleCell symbol="orange" size={size} dashed={false} />
          </View>
        </>
      );
    case 'edge-clues':
      return (
        <>
          <View style={row}>
            <ExampleCell symbol="monkey" size={size} dashed={false} />
            <AppText>{sameMark}</AppText>
            <ExampleCell symbol="monkey" size={size} dashed={false} />
          </View>
          <View style={row}>
            <ExampleCell symbol="monkey" size={size} dashed={false} />
            <AppText>{oppositeMark}</AppText>
            <ExampleCell symbol="orange" size={size} dashed={false} />
          </View>
        </>
      );
    default: {
      const neverRule: never = rule;
      return neverRule;
    }
  }
}

const exampleXml = {
  monkey: grinMonkeySvg,
  orange: compactOrangeSvg,
} as const;

function ExampleCell({
  symbol,
  size,
  dashed,
}: {
  readonly symbol: SymbolName;
  readonly size: number;
  readonly dashed: boolean;
}): React.JSX.Element {
  const { colors } = useTheme();
  // Dashed textPrimary is the same outline a broken line uses on the Puzzle.
  const borderColor = dashed ? colors.textPrimary : colors.border;
  const backgroundColor = colors[symbol];
  const style = useMemo(
    () => ({
      width: size,
      height: size,
      borderWidth: 1,
      borderStyle: dashed ? ('dashed' as const) : ('solid' as const),
      borderColor,
      backgroundColor,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    }),
    [backgroundColor, borderColor, dashed, size],
  );
  const xml = exampleXml[symbol];

  return (
    <View style={style}>
      <SvgXml xml={xml} width="72%" height="72%" accessible={false} />
    </View>
  );
}
