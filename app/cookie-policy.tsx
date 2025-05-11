import React from "react";
import { StyleSheet, Text, View, ScrollView, Switch } from "react-native";
import colors from "@/constants/colors";
import typography from "@/constants/typography";

export default function CookiePolicyScreen() {
  const [necessaryCookies, setNecessaryCookies] = React.useState(true);
  const [preferenceCookies, setPreferenceCookies] = React.useState(true);
  const [statisticsCookies, setStatisticsCookies] = React.useState(true);
  const [marketingCookies, setMarketingCookies] = React.useState(false);
  
  // Necessary cookies cannot be disabled
  const toggleNecessaryCookies = () => {
    // Do nothing, these are required
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={[typography.h1, styles.title]}>Cookie Policy</Text>
        <Text style={styles.lastUpdated}>Last Updated: June 15, 2023</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.paragraph}>
          This Cookie Policy explains how Trend Forge ("we", "us", or "our") uses cookies and similar technologies to recognize you when you visit our mobile application and website (together, "Services"). It explains what these technologies are and why we use them, as well as your rights to control our use of them.
        </Text>
        
        <Text style={[typography.h3, styles.subsectionTitle]}>What are cookies?</Text>
        <Text style={styles.paragraph}>
          Cookies are small data files that are placed on your device when you visit a website or use a mobile application. Cookies are widely used by website and app owners to make their platforms work, or to work more efficiently, as well as to provide reporting information.
        </Text>
        <Text style={styles.paragraph}>
          Cookies set by the website or app owner (in this case, Trend Forge) are called "first-party cookies". Cookies set by parties other than the website owner are called "third-party cookies". Third-party cookies enable third-party features or functionality to be provided on or through the website or app (such as advertising, interactive content, and analytics).
        </Text>
        
        <Text style={[typography.h3, styles.subsectionTitle]}>Why do we use cookies?</Text>
        <Text style={styles.paragraph}>
          We use first-party and third-party cookies for several reasons. Some cookies are required for technical reasons in order for our Services to operate, and we refer to these as "essential" or "necessary" cookies. Other cookies also enable us to track and target the interests of our users to enhance the experience on our Services. Third parties serve cookies through our Services for advertising, analytics, and other purposes.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[typography.h2, styles.sectionTitle]}>Types of cookies we use</Text>
        
        <View style={styles.cookieType}>
          <View style={styles.cookieTypeHeader}>
            <View>
              <Text style={styles.cookieTypeTitle}>Necessary Cookies</Text>
              <Text style={styles.cookieTypeRequired}>(Required)</Text>
            </View>
            <Switch
              value={necessaryCookies}
              onValueChange={toggleNecessaryCookies}
              disabled={true}
              trackColor={{ false: colors.inactive, true: colors.primary }}
              thumbColor={colors.card}
            />
          </View>
          <Text style={styles.cookieTypeDescription}>
            These cookies are essential for you to browse the application and use its features, such as accessing secure areas. These cookies cannot be disabled.
          </Text>
        </View>
        
        <View style={styles.cookieType}>
          <View style={styles.cookieTypeHeader}>
            <Text style={styles.cookieTypeTitle}>Preference Cookies</Text>
            <Switch
              value={preferenceCookies}
              onValueChange={setPreferenceCookies}
              trackColor={{ false: colors.inactive, true: colors.primary }}
              thumbColor={colors.card}
            />
          </View>
          <Text style={styles.cookieTypeDescription}>
            These cookies allow us to remember choices you make when you use our application, such as remembering your login details or language preference. The purpose of these cookies is to provide you with a more personal experience.
          </Text>
        </View>
        
        <View style={styles.cookieType}>
          <View style={styles.cookieTypeHeader}>
            <Text style={styles.cookieTypeTitle}>Statistics Cookies</Text>
            <Switch
              value={statisticsCookies}
              onValueChange={setStatisticsCookies}
              trackColor={{ false: colors.inactive, true: colors.primary }}
              thumbColor={colors.card}
            />
          </View>
          <Text style={styles.cookieTypeDescription}>
            These cookies collect information about how you use our application, which pages you visited and which links you clicked on. All of the data is anonymized and cannot be used to identify you.
          </Text>
        </View>
        
        <View style={styles.cookieType}>
          <View style={styles.cookieTypeHeader}>
            <Text style={styles.cookieTypeTitle}>Marketing Cookies</Text>
            <Switch
              value={marketingCookies}
              onValueChange={setMarketingCookies}
              trackColor={{ false: colors.inactive, true: colors.primary }}
              thumbColor={colors.card}
            />
          </View>
          <Text style={styles.cookieTypeDescription}>
            These cookies track your browsing habits to enable us to show advertising which is more likely to be of interest to you. These cookies use information about your browsing history to group you with other users who have similar interests.
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[typography.h2, styles.sectionTitle]}>How can you control cookies?</Text>
        <Text style={styles.paragraph}>
          You have the right to decide whether to accept or reject cookies (except for necessary cookies which are required for the functioning of our Services). You can exercise your cookie preferences by using the toggles above.
        </Text>
        <Text style={styles.paragraph}>
          You can also set or amend your web browser controls to accept or refuse cookies. If you choose to reject cookies, you may still use our Services though your access to some functionality and areas may be restricted.
        </Text>
        <Text style={styles.paragraph}>
          The specific types of first and third-party cookies served through our Services and the purposes they perform are described in the table below:
        </Text>
        
        <View style={styles.cookieTable}>
          <View style={styles.cookieTableRow}>
            <Text style={[styles.cookieTableCell, styles.cookieTableHeader]}>Cookie Name</Text>
            <Text style={[styles.cookieTableCell, styles.cookieTableHeader]}>Purpose</Text>
            <Text style={[styles.cookieTableCell, styles.cookieTableHeader]}>Duration</Text>
          </View>
          <View style={styles.cookieTableRow}>
            <Text style={styles.cookieTableCell}>auth_token</Text>
            <Text style={styles.cookieTableCell}>Authentication</Text>
            <Text style={styles.cookieTableCell}>Session</Text>
          </View>
          <View style={styles.cookieTableRow}>
            <Text style={styles.cookieTableCell}>user_preferences</Text>
            <Text style={styles.cookieTableCell}>User settings</Text>
            <Text style={styles.cookieTableCell}>1 year</Text>
          </View>
          <View style={styles.cookieTableRow}>
            <Text style={styles.cookieTableCell}>_ga</Text>
            <Text style={styles.cookieTableCell}>Google Analytics</Text>
            <Text style={styles.cookieTableCell}>2 years</Text>
          </View>
          <View style={styles.cookieTableRow}>
            <Text style={styles.cookieTableCell}>_fbp</Text>
            <Text style={styles.cookieTableCell}>Facebook Pixel</Text>
            <Text style={styles.cookieTableCell}>3 months</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[typography.h2, styles.sectionTitle]}>How often will we update this Cookie Policy?</Text>
        <Text style={styles.paragraph}>
          We may update this Cookie Policy from time to time in order to reflect, for example, changes to the cookies we use or for other operational, legal, or regulatory reasons. Please therefore revisit this Cookie Policy regularly to stay informed about our use of cookies and related technologies.
        </Text>
        <Text style={styles.paragraph}>
          The date at the top of this Cookie Policy indicates when it was last updated.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[typography.h2, styles.sectionTitle]}>Where can you get further information?</Text>
        <Text style={styles.paragraph}>
          If you have any questions about our use of cookies or other technologies, please email us at privacy@trendforge.com or contact us through the methods described in our Privacy Policy.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    backgroundColor: colors.card,
    marginBottom: 16,
  },
  title: {
    marginBottom: 8,
  },
  lastUpdated: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  section: {
    backgroundColor: colors.card,
    marginBottom: 16,
    padding: 20,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  subsectionTitle: {
    marginTop: 20,
    marginBottom: 12,
  },
  paragraph: {
    ...typography.body,
    marginBottom: 16,
  },
  cookieType: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cookieTypeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cookieTypeTitle: {
    ...typography.body,
    fontWeight: "600",
  },
  cookieTypeRequired: {
    ...typography.bodySmall,
    color: colors.primary,
    marginTop: 2,
  },
  cookieTypeDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  cookieTable: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    overflow: "hidden",
  },
  cookieTableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cookieTableHeader: {
    backgroundColor: colors.background,
    fontWeight: "600",
  },
  cookieTableCell: {
    flex: 1,
    padding: 12,
    ...typography.bodySmall,
  },
});
