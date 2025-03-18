// package com.example.tierlist.models;

// import jakarta.persistence.*;
// import java.util.Map;

// @Entity
// @Table(name = "tier_lists")
// public class TierList {

//     @Id
//     @GeneratedValue(strategy = GenerationType.IDENTITY)
//     private Long id;

//     private String name;

//     @ElementCollection
//     @CollectionTable(name = "tier_entries", joinColumns = @JoinColumn(name = "tier_list_id"))
//     @MapKeyColumn(name = "tier")
//     @Column(name = "items")
//     private Map<String, String> tiers; // JSON-like key-value storage

//     public TierList() {}

//     public TierList(String name, Map<String, String> tiers) {
//         this.name = name;
//         this.tiers = tiers;
//     }

//     public Long getId() { return id; }
//     public void setId(Long id) { this.id = id; }

//     public String getName() { return name; }
//     public void setName(String name) { this.name = name; }

//     public Map<String, String> getTiers() { return tiers; }
//     public void setTiers(Map<String, String> tiers) { this.tiers = tiers; }
// }