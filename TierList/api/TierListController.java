// package com.example.tierlist.controllers;

// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.*;

// import com.example.tierlist.models.TierList;
// import com.example.tierlist.repositories.TierListRepository;

// import java.util.List;
// import java.util.Optional;

// @RestController
// @RequestMapping("/tierlist")
// @CrossOrigin(origins = "*") // Allows frontend to call API
// public class TierListController {

//     @Autowired
//     private TierListRepository tierListRepository;

//     // get all tier lists
//     @GetMapping("/all")
//     public List<TierList> getAllTierLists() {
//         return tierListRepository.findAll();
//     }

//     // get a tier list by ID
//     @GetMapping("/{id}")
//     public ResponseEntity<TierList> getTierListById(@PathVariable Long id) {
//         Optional<TierList> tierList = tierListRepository.findById(id);
//         return tierList.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
//     }

//     // create a new tier list
//     @PostMapping("/create")
//     public ResponseEntity<TierList> createTierList(@RequestBody TierList newTierList) {
//         return ResponseEntity.ok(tierListRepository.save(newTierList));
//     }

//     // update a tier list
//     @PutMapping("/update/{id}")
//     public ResponseEntity<TierList> updateTierList(@PathVariable Long id, @RequestBody TierList updatedList) {
//         return tierListRepository.findById(id).map(existingList -> {
//             existingList.setName(updatedList.getName());
//             existingList.setTiers(updatedList.getTiers());
//             return ResponseEntity.ok(tierListRepository.save(existingList));
//         }).orElseGet(() -> ResponseEntity.notFound().build());
//     }

//     // delete a tier list
//     @DeleteMapping("/delete/{id}")
//     public ResponseEntity<String> deleteTierList(@PathVariable Long id) {
//         if (tierListRepository.existsById(id)) {
//             tierListRepository.deleteById(id);
//             return ResponseEntity.ok("Tier List deleted successfully.");
//         } else {
//             return ResponseEntity.notFound().build();
//         }
//     }
// }