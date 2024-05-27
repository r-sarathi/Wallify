import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, FontAwesome6, Ionicons } from "@expo/vector-icons";
import { theme } from "../../constants/theme";
import { wp, hp } from "../../helpers/common";
import CategoriesBox from "../../components/CategoriesBox";
import { apiCall } from "../../api/index";
import ImageGrid from "../../components/ImageGrid";
import { debounce, filter } from "lodash";
import FilterModal from "../../components/FilterModal";

var page = 1;

const Home = () => {
  const { top } = useSafeAreaInsets();
  const paddingTop = top > 0 ? top + 10 : 30;
  const [search, setSearch] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const searchInputRef = useRef(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const modalRef = useRef(null);
  const [filters, setFilters] = useState(null);

  useEffect(() => {
    fetchImage({ page });
  }, []);

  const fetchImage = async (params = { page: 1 }, append = true) => {
    setLoading(true);
    setError(null);
    try {
      let res = await apiCall(params);
      if (res.success && res?.data?.hits) {
        if (append) {
          setImages((prevImages) => [...prevImages, ...res.data.hits]);
        } else {
          setImages([...res.data.hits]);
        }
      } else {
        setError("Failed to fetch images");
      }
    } catch (err) {
      setError("An error occurred while fetching images");
    } finally {
      setLoading(false);
    }
  };

  const handleCategory = (cat) => {
    setActiveCategory(cat);
    clearSearch();
    setImages([]);
    let params = {
      page,
      ...filters,
    };
    if (cat) params.category = cat;
    fetchImage(params, false);
  };

  const handleSearch = (text) => {
    setSearch(text);
    if (text.length > 2) {
      setImages([]);
      setActiveCategory(null);
      fetchImage({ page, q: text }, false);
    }
    if (text === "") {
      setImages([]);
      setActiveCategory(null);
      fetchImage({ page }, false);
    }
  };

  const handleTextDebounce = useCallback(debounce(handleSearch, 400), []);

  const clearSearch = () => {
    setSearch("");
    searchInputRef?.current.clear();
    fetchImage({ page });
  };

  const openFilterModal = () => {
    modalRef?.current?.present();
  };

  const closeFilterModal = () => {
    modalRef?.current?.close();
  };

  const applyFilter = () => {
    if (filters) {
      page = 1;
      setImages([]);
      let params = {
        page,
        ...filters,
      };
      if (activeCategory) params.category = activeCategory;
      if (search) params.q = search;
      fetchImage(params, false);
    }
    closeFilterModal();
  };

  const resetFilter = () => {
    if (filters) {
      page = 1;
      setImages(null);
      let params = {
        page,
      };
      if (activeCategory) params.category = activeCategory;
      if (search) params.q = search;
      fetchImage(params, false);
    }
    closeFilterModal();
  };

  console.log("Filters: ", filters);

  return (
    <View style={[styles.container, { paddingTop }]}>
      <View style={styles.header}>
        <Pressable>
          <Text style={styles.title}>Wallify</Text>
        </Pressable>
        <Pressable onPress={openFilterModal}>
          <FontAwesome6
            name="bars-staggered"
            size={22}
            color={theme.colors.neutral(0.7)}
          />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={{ gap: 15 }}>
        <View style={styles.searchBar}>
          <View style={styles.searchIcon}>
            <Feather
              name="search"
              size={24}
              color={theme.colors.neutral(0.4)}
            />
          </View>
          <TextInput
            placeholder="Search for photos..."
            style={styles.searchInput}
            onChangeText={handleTextDebounce}
            ref={searchInputRef}
          />
          {search && (
            <Pressable style={styles.closeIcon} onPress={clearSearch}>
              <Ionicons
                name="close"
                size={24}
                color={theme.colors.neutral(0.6)}
              />
            </Pressable>
          )}
        </View>
        <View style={styles.categories}>
          <CategoriesBox
            activeCategory={activeCategory}
            handleCategory={handleCategory}
          />
        </View>
        {filters && (
          <View>
            <ScrollView
              horizontal
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.filter}
            >
              {Object.keys(filters).map((key, index) => {
                return (
                  <View key={key} style={styles.filterItem}>
                    <Text style={styles.filterItemText}>{filters[key]}</Text>
                    <Pressable
                      style={styles.filterCloseIcon}
                      onPress={() => clearThisFilter(key)}
                    >
                      <Ionicons
                        name="close"
                        size={22}
                        color={theme.colors.neutral(0.6)}
                      />
                    </Pressable>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}
        <View>
          {loading ? (
            <ActivityIndicator size="large" color={theme.colors.primary} />
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            images.length > 0 && <ImageGrid images={images} />
          )}
        </View>
      </ScrollView>

      <FilterModal
        modalRef={modalRef}
        filters={filters}
        setFilters={setFilters}
        onClose={closeFilterModal}
        onApply={applyFilter}
        onReset={resetFilter}
      />
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 15,
    backgroundColor: theme.colors.white,
  },
  header: {
    marginHorizontal: wp(4),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: hp(4),
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.neutral(0.9),
  },
  searchBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.grayBG,
    backgroundColor: theme.colors.white,
    padding: 6,
    paddingLeft: 10,
    borderRadius: theme.radius.lg,
    marginHorizontal: wp(4),
  },
  searchIcon: {
    padding: 8,
  },
  searchInput: {
    flex: 1,
    borderRadius: theme.radius.sm,
    paddingVertical: 10,
    fontSize: hp(1.8),
  },
  closeIcon: {
    backgroundColor: theme.colors.neutral(0.1),
    padding: 8,
    borderRadius: theme.radius.sm,
  },
  categories: {
    marginHorizontal: wp(4),
  },
  errorText: {
    textAlign: "center",
    color: theme.colors.error,
    marginTop: hp(2),
  },
  filter: {
    paddingHorizontal: wp(4),
    gap: 10,
  },
  filterItem: {
    backgroundColor: theme.colors.grayBG,
    padding: 8,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: theme.radius.xs,
    gap: 10,
    paddingHorizontal: 10,
  },
  filterItemText: {
    fontSize: hp(1.9),
    textTransform: "capitalize",
  },
});
