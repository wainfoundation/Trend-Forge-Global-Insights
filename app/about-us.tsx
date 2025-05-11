import React from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  Linking 
} from "react-native";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { Facebook, Twitter, Instagram, Linkedin, Youtube, ExternalLink } from "lucide-react-native";

export default function AboutUsScreen() {
  const openLink = (url: string) => {
    Linking.openURL(url).catch(err => console.error("Failed to open URL:", err));
  };

  const openSocialMedia = (platform: string) => {
    const urls = {
      facebook: "https://facebook.com/trendforge",
      twitter: "https://twitter.com/trendforge",
      instagram: "https://instagram.com/trendforge",
      linkedin: "https://linkedin.com/company/trendforge",
      youtube: "https://youtube.com/trendforge"
    };
    
    openLink(urls[platform as keyof typeof urls]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.heroSection}>
        <Image 
          source={{ uri: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" }} 
          style={styles.heroImage}
          resizeMode="cover"
        />
        <View style={styles.heroOverlay}>
          <Text style={styles.heroTitle}>Trend Forge</Text>
          <Text style={styles.heroSubtitle}>Journalism Reimagined for the Digital Age</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[typography.h2, styles.sectionTitle]}>Our Story</Text>
        <Text style={styles.paragraph}>
          Founded in 2022, Trend Forge emerged from a vision to revolutionize how news is created, distributed, and monetized in the digital age. We recognized the challenges facing traditional journalism—declining revenues, eroding trust, and the struggle to adapt to changing consumption habits.
        </Text>
        <Text style={styles.paragraph}>
          Our founders, a team of journalists, technologists, and blockchain enthusiasts, saw an opportunity to leverage the Pi Network ecosystem to create a sustainable platform that rewards quality journalism while keeping content accessible to readers worldwide.
        </Text>
        <Text style={styles.paragraph}>
          Today, Trend Forge stands at the intersection of trusted journalism and innovative technology, providing a platform where readers can access reliable information and journalists can be fairly compensated for their work.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[typography.h2, styles.sectionTitle]}>Our Mission</Text>
        <Text style={styles.paragraph}>
          At Trend Forge, our mission is to empower both readers and journalists through a transparent, accessible, and sustainable news ecosystem. We believe that:
        </Text>
        <View style={styles.missionPoints}>
          <View style={styles.missionPoint}>
            <View style={styles.missionPointDot} />
            <Text style={styles.missionPointText}>Quality journalism should be accessible to everyone</Text>
          </View>
          <View style={styles.missionPoint}>
            <View style={styles.missionPointDot} />
            <Text style={styles.missionPointText}>Content creators deserve fair compensation for their work</Text>
          </View>
          <View style={styles.missionPoint}>
            <View style={styles.missionPointDot} />
            <Text style={styles.missionPointText}>Technology should enhance, not replace, human journalism</Text>
          </View>
          <View style={styles.missionPoint}>
            <View style={styles.missionPointDot} />
            <Text style={styles.missionPointText}>Trust and transparency are fundamental to media integrity</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[typography.h2, styles.sectionTitle]}>Pi Network Integration</Text>
        <Text style={styles.paragraph}>
          Trend Forge is proud to be built on the Pi Network ecosystem, a cryptocurrency platform designed for everyday people. This integration allows us to:
        </Text>
        <Text style={styles.bulletPoint}>• Provide secure and seamless authentication</Text>
        <Text style={styles.bulletPoint}>• Enable micropayments for content without traditional banking barriers</Text>
        <Text style={styles.bulletPoint}>• Create a direct economic relationship between readers and journalists</Text>
        <Text style={styles.bulletPoint}>• Build a sustainable business model that doesn't rely solely on advertising</Text>
        <TouchableOpacity 
          style={styles.learnMoreButton}
          onPress={() => openLink("https://minepi.com")}
        >
          <Text style={styles.learnMoreButtonText}>Learn more about Pi Network</Text>
          <ExternalLink size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.teamSection}>
        <Text style={[typography.h2, styles.sectionTitle]}>Our Leadership Team</Text>
        
        <View style={styles.teamMember}>
          <Image 
            source={{ uri: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80" }} 
            style={styles.teamMemberImage}
          />
          <View style={styles.teamMemberInfo}>
            <Text style={styles.teamMemberName}>Michael Chen</Text>
            <Text style={styles.teamMemberTitle}>Co-Founder & CEO</Text>
            <Text style={styles.teamMemberBio}>
              Former technology journalist with 15 years of experience at major publications. Michael leads our strategic vision and business development.
            </Text>
          </View>
        </View>
        
        <View style={styles.teamMember}>
          <Image 
            source={{ uri: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80" }} 
            style={styles.teamMemberImage}
          />
          <View style={styles.teamMemberInfo}>
            <Text style={styles.teamMemberName}>Sarah Johnson</Text>
            <Text style={styles.teamMemberTitle}>Co-Founder & Editor-in-Chief</Text>
            <Text style={styles.teamMemberBio}>
              Pulitzer Prize-winning journalist with a passion for investigative reporting. Sarah oversees our editorial standards and content strategy.
            </Text>
          </View>
        </View>
        
        <View style={styles.teamMember}>
          <Image 
            source={{ uri: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80" }} 
            style={styles.teamMemberImage}
          />
          <View style={styles.teamMemberInfo}>
            <Text style={styles.teamMemberName}>David Rodriguez</Text>
            <Text style={styles.teamMemberTitle}>CTO</Text>
            <Text style={styles.teamMemberBio}>
              Blockchain developer and former engineering lead at major tech companies. David leads our technology development and Pi Network integration.
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.statsSection}>
        <Text style={[typography.h2, styles.sectionTitle]}>Trend Forge by the Numbers</Text>
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>500+</Text>
            <Text style={styles.statLabel}>Journalists</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>2M+</Text>
            <Text style={styles.statLabel}>Monthly Readers</Text>
          </View>
        </View>
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>30+</Text>
            <Text style={styles.statLabel}>Countries</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>10K+</Text>
            <Text style={styles.statLabel}>Articles Published</Text>
          </View>
        </View>
      </View>

      <View style={styles.socialSection}>
        <Text style={[typography.h3, styles.socialTitle]}>Connect With Us</Text>
        <View style={styles.socialIcons}>
          <TouchableOpacity 
            style={styles.socialIcon} 
            onPress={() => openSocialMedia("facebook")}
          >
            <Facebook size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.socialIcon} 
            onPress={() => openSocialMedia("twitter")}
          >
            <Twitter size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.socialIcon} 
            onPress={() => openSocialMedia("instagram")}
          >
            <Instagram size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.socialIcon} 
            onPress={() => openSocialMedia("linkedin")}
          >
            <Linkedin size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.socialIcon} 
            onPress={() => openSocialMedia("youtube")}
          >
            <Youtube size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.ctaSection}>
        <Text style={styles.ctaTitle}>Join the Trend Forge Community</Text>
        <Text style={styles.ctaText}>
          Whether you're a reader seeking quality journalism or a writer looking to share your voice, Trend Forge welcomes you.
        </Text>
        <View style={styles.ctaButtons}>
          <TouchableOpacity 
            style={[styles.ctaButton, styles.primaryButton]}
            onPress={() => openLink("https://trendforge.com/subscribe")}
          >
            <Text style={styles.primaryButtonText}>Subscribe Now</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.ctaButton, styles.secondaryButton]}
            onPress={() => openLink("https://trendforge.com/careers")}
          >
            <Text style={styles.secondaryButtonText}>Join Our Team</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  heroSection: {
    height: 240,
    position: "relative",
    marginBottom: 16,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 20,
  },
  heroTitle: {
    fontFamily: "serif",
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: "#ffffff",
  },
  section: {
    backgroundColor: colors.card,
    marginBottom: 16,
    padding: 20,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  paragraph: {
    ...typography.body,
    marginBottom: 16,
  },
  missionPoints: {
    marginTop: 8,
  },
  missionPoint: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  missionPointDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: 8,
    marginRight: 12,
  },
  missionPointText: {
    ...typography.body,
    flex: 1,
  },
  bulletPoint: {
    ...typography.body,
    marginBottom: 8,
    paddingLeft: 8,
  },
  learnMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  learnMoreButtonText: {
    ...typography.body,
    color: colors.primary,
    marginRight: 8,
  },
  teamSection: {
    backgroundColor: colors.card,
    marginBottom: 16,
    padding: 20,
  },
  teamMember: {
    flexDirection: "row",
    marginBottom: 20,
  },
  teamMemberImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  teamMemberInfo: {
    flex: 1,
  },
  teamMemberName: {
    ...typography.body,
    fontWeight: "600",
    marginBottom: 4,
  },
  teamMemberTitle: {
    ...typography.bodySmall,
    color: colors.primary,
    marginBottom: 8,
  },
  teamMemberBio: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  statsSection: {
    backgroundColor: colors.card,
    marginBottom: 16,
    padding: 20,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    backgroundColor: colors.background,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  statNumber: {
    ...typography.h2,
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  socialSection: {
    backgroundColor: colors.card,
    marginBottom: 16,
    padding: 20,
    alignItems: "center",
  },
  socialTitle: {
    marginBottom: 16,
  },
  socialIcons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
  },
  socialIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  ctaSection: {
    backgroundColor: colors.primary,
    marginBottom: 32,
    padding: 20,
    alignItems: "center",
  },
  ctaTitle: {
    ...typography.h2,
    color: colors.card,
    marginBottom: 12,
    textAlign: "center",
  },
  ctaText: {
    ...typography.body,
    color: colors.card,
    marginBottom: 20,
    textAlign: "center",
  },
  ctaButtons: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 12,
  },
  ctaButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 150,
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: colors.card,
  },
  primaryButtonText: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.card,
  },
  secondaryButtonText: {
    color: colors.card,
    fontWeight: "600",
    fontSize: 16,
  },
});
