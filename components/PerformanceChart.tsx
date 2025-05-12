import React from "react";
import { StyleSheet, Text, View, Dimensions } from "react-native";
import colors from "@/constants/colors";
import typography from "@/constants/typography";

interface PerformanceChartProps {
  data: {
    label: string;
    value: number;
    color: string;
  }[];
  title?: string;
}

export default function PerformanceChart({ data, title }: PerformanceChartProps) {
  const maxValue = Math.max(...data.map(item => item.value));
  
  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      
      <View style={styles.chartContainer}>
        {data.map((item, index) => (
          <View key={index} style={styles.barContainer}>
            <View style={styles.labelContainer}>
              <Text style={styles.label} numberOfLines={1}>
                {item.label}
              </Text>
            </View>
            <View style={styles.barWrapper}>
              <View
                style={[
                  styles.bar,
                  {
                    width: `${(item.value / maxValue) * 100}%`,
                    backgroundColor: item.color,
                  },
                ]}
              />
              <Text style={styles.value}>{item.value}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    ...typography.body,
    fontWeight: "500",
    marginBottom: 16,
  },
  chartContainer: {
    gap: 12,
  },
  barContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  labelContainer: {
    width: 80,
    marginRight: 8,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  barWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: 24,
  },
  bar: {
    height: 16,
    borderRadius: 4,
  },
  value: {
    ...typography.caption,
    marginLeft: 8,
    fontWeight: "500",
  },
});
