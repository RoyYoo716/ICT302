import { useCallback, useMemo, useState } from "react";
import { useFocusEffect } from "expo-router";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import Feather from "@expo/vector-icons/Feather";
import { AppScreen } from "../../src/components/ui/AppScreen";
import { BottomNav } from "../../src/components/layout/BottomNav";
import { colors } from "../../src/constants/colors";
import { spacing } from "../../src/constants/spacing";
import { typography } from "../../src/constants/typography";
import { deleteScanHistoryRecord, getScanHistory } from "../../src/services/scanHistory";
import { formatScanTime, truncateMiddle } from "../../src/utils/formatters";

const filters = [
  { key: "all", label: "All" },
  { key: "safe", label: "Safe" },
  { key: "blocked", label: "Blocked" }
];

export default function HistoryRoute() {
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      async function loadHistory() {
        const scans = await getScanHistory();
        if (mounted) setHistory(scans);
      }

      loadHistory();

      return () => {
        mounted = false;
      };
    }, [])
  );

  const filteredHistory = useMemo(() => {
    const query = search.trim().toLowerCase();

    return history.filter((item) => {
      const matchesFilter = filter === "all" || item.status === filter;
      const matchesSearch =
        !query ||
        item.domain.toLowerCase().includes(query) ||
        item.url.toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [filter, history, search]);

  async function handleCopy(item) {
    const value = item.url || item.link || item.qrContent || item.domain;
    if (!value) return;

    await Clipboard.setStringAsync(value);
    Alert.alert("Copied", "Copied to clipboard.");
  }

  function handleDelete(item) {
    Alert.alert("Delete this scan history?", "", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const previousHistory = history;
          setHistory((current) => current.filter((record) => record.id !== item.id));

          try {
            await deleteScanHistoryRecord(item.id);
            Alert.alert("Deleted", "Scan history deleted.");
          } catch {
            setHistory(previousHistory);
            Alert.alert("Delete Failed", "Unable to delete scan history right now.");
          }
        }
      }
    ]);
  }

  return (
    <View style={styles.root}>
      <AppScreen scroll showsVerticalScrollIndicator contentStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Scan History</Text>
          <View style={styles.filterIcon}>
            <Feather name="filter" size={18} color={colors.blue300} />
          </View>
        </View>

        <View style={styles.searchBox}>
          <Feather name="search" size={16} color={colors.blue300} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search domains..."
            placeholderTextColor="#3D74B5"
            style={styles.searchInput}
          />
        </View>

        <View style={styles.filterRow}>
          {filters.map((item) => {
            const active = filter === item.key;
            return (
              <Pressable
                key={item.key}
                onPress={() => setFilter(item.key)}
                style={[styles.filterButton, active ? styles.filterButtonActive : null]}
              >
                <Text style={[styles.filterText, active ? styles.filterTextActive : null]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.list}>
          {filteredHistory.map((item) => (
            <HistoryCard
              key={item.id}
              item={item}
              onCopy={() => handleCopy(item)}
              onDelete={() => handleDelete(item)}
            />
          ))}
          {filteredHistory.length === 0 ? (
            <Text style={styles.empty}>No scan records found.</Text>
          ) : null}
        </View>
      </AppScreen>
      <BottomNav active="history" />
    </View>
  );
}

function HistoryCard({ item, onCopy, onDelete }) {
  const isSafe = item.status === "safe";

  return (
    <View style={styles.card}>
      <View style={[styles.statusIcon, isSafe ? styles.safeIcon : styles.blockedIcon]}>
        <Feather name="shield" size={18} color={isSafe ? colors.green500 : colors.danger300} />
      </View>
      <View style={styles.cardMain}>
        <View style={styles.domainRow}>
          <Text style={styles.domain}>{item.domain}</Text>
          <Text style={[styles.badge, isSafe ? styles.safeBadge : styles.blockedBadge]}>
            {isSafe ? "SAFE" : "BLOCKED"}
          </Text>
        </View>
        <Text style={styles.url}>{truncateMiddle(item.url, 34)}</Text>
        <View style={styles.divider} />
        <View style={styles.cardBottom}>
          <View style={styles.timeRow}>
            <Feather name="clock" size={12} color={colors.textSubtle} />
            <Text style={styles.time}>{formatScanTime(item.scannedAt)}</Text>
          </View>
          <View style={styles.actions}>
            <Pressable style={styles.actionButton} onPress={onCopy}>
              <Feather name="copy" size={14} color={colors.blue300} />
            </Pressable>
            <Pressable style={[styles.actionButton, styles.deleteAction]} onPress={onDelete}>
              <Feather name="trash-2" size={14} color={colors.danger300} />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 30,
    paddingTop: 14,
    paddingBottom: spacing.bottomNavHeight + 22,
    backgroundColor: colors.background
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22
  },
  title: {
    color: colors.white,
    fontSize: 22,
    lineHeight: 29,
    fontWeight: "800"
  },
  filterIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center"
  },
  searchBox: {
    minHeight: 45,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    marginBottom: 14
  },
  searchInput: {
    flex: 1,
    color: colors.white,
    fontSize: 14,
    lineHeight: 20,
    paddingVertical: 0
  },
  filterRow: {
    flexDirection: "row",
    gap: 9,
    marginBottom: 20
  },
  filterButton: {
    minHeight: 31,
    minWidth: 58,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 13
  },
  filterButtonActive: {
    backgroundColor: colors.blue400,
    borderColor: colors.blue400,
    shadowColor: colors.blue400,
    shadowOpacity: 0.38,
    shadowRadius: 12,
    elevation: 6
  },
  filterText: {
    color: colors.textSubtle,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800",
    fontFamily: "monospace"
  },
  filterTextActive: {
    color: colors.white
  },
  list: {
    gap: 12
  },
  card: {
    minHeight: 116,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(70,130,210,0.18)",
    backgroundColor: colors.surface,
    flexDirection: "row",
    gap: 12,
    padding: 14
  },
  statusIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center"
  },
  safeIcon: {
    backgroundColor: "rgba(0,214,155,0.14)"
  },
  blockedIcon: {
    backgroundColor: "rgba(255,93,103,0.17)"
  },
  cardMain: {
    flex: 1,
    minWidth: 0
  },
  domainRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2
  },
  domain: {
    flex: 1,
    color: colors.white,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "800"
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 3,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "800"
  },
  safeBadge: {
    color: colors.green300,
    backgroundColor: "rgba(0,214,155,0.18)"
  },
  blockedBadge: {
    color: colors.danger300,
    backgroundColor: "rgba(255,93,103,0.2)"
  },
  url: {
    color: colors.textSubtle,
    fontSize: 11,
    lineHeight: 15,
    fontFamily: "monospace"
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(90,145,210,0.16)",
    marginVertical: 12
  },
  cardBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10
  },
  timeRow: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 5
  },
  time: {
    color: colors.textSubtle,
    fontSize: 11,
    lineHeight: 15
  },
  actions: {
    flexDirection: "row",
    gap: 8
  },
  actionButton: {
    width: 29,
    height: 29,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(77,152,255,0.14)"
  },
  deleteAction: {
    backgroundColor: "rgba(255,93,103,0.15)"
  },
  empty: {
    ...typography.bodySmall,
    color: colors.textSubtle,
    textAlign: "center",
    marginTop: 26
  }
});
