import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface FAQ {
  question: string;
  answer: string;
}

interface Plant {
  name: string;
  image: string;
  faqs: FAQ[];
}

@Component({
  selector: 'app-guide',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './guide.component.html',
  styleUrls: ['./guide.component.css']
})
export class GuideComponent {
  plants: Plant[] = [
    {
      "name": "Cabbage",
      "image": "../../../assets/Plants/cabbage.png",
      "faqs": [
        {
          "question": "What are the ideal growing conditions for cabbage?",
          "answer": "Cabbage thrives in cool temperatures between 15°C and 20°C. It requires full sunlight for at least 6 hours a day and well-drained, fertile soil rich in organic matter. The soil should have a pH level between 6.0 and 7.5."
        },
        {
          "question": "How often should I water cabbage?",
          "answer": "Water cabbage regularly to maintain moist soil, but avoid waterlogging. Water deeply once or twice a week depending on the weather, ensuring the top 6 inches of soil remain consistently moist."
        },
        {
          "question": "How long does it take for cabbage to mature?",
          "answer": "Cabbage typically takes 70 to 90 days from transplanting to reach full maturity, depending on the variety and growing conditions."
        },
        {
          "question": "How can I prevent pests on cabbage plants?",
          "answer": "Cabbage can be prone to pests such as aphids, caterpillars, and cabbage worms. Prevent pests by using row covers, applying organic insecticidal soap, and introducing beneficial insects like ladybugs."
        },
        {
          "question": "What is the best time to harvest cabbage?",
          "answer": "Cabbage is ready for harvest when the heads are firm, and the leaves are tightly packed. Harvest before the heads split, usually between 70 and 90 days after transplanting."
        }
      ]
    },
    {
      "name": "Carrot",
      "image": "../../../assets/Plants/carrot.png",
      "faqs": [
        {
          "question": "What type of soil do carrots prefer?",
          "answer": "Carrots prefer deep, loose, and well-drained soil. The soil should be free of rocks and clumps that could inhibit root growth. A slightly sandy soil with a pH of 6.0 to 6.8 is ideal."
        },
        {
          "question": "How deep should I plant carrot seeds?",
          "answer": "Carrot seeds should be planted about 1/4 inch deep. Space them 1-2 inches apart in rows that are 12 inches apart."
        },
        {
          "question": "How long does it take for carrots to grow?",
          "answer": "Carrots typically take 70 to 80 days to grow, but this can vary depending on the variety and growing conditions."
        },
        {
          "question": "What temperature is best for growing carrots?",
          "answer": "Carrots grow best in temperatures between 16°C and 18°C. They can tolerate light frosts but are more sensitive to extreme heat."
        },
        {
          "question": "How can I tell when carrots are ready for harvest?",
          "answer": "Carrots are ready to harvest when the roots have reached a suitable size and are firm. Depending on the variety, this could be anywhere from 70 to 80 days after planting."
        }
      ]
    },
    {
      "name": "Corn",
      "image": "../../../assets/Plants/corn.png",
      "faqs": [
        {
          "question": "What are the ideal growing conditions for corn?",
          "answer": "Corn thrives in warm temperatures between 18°C and 30°C. It requires full sunlight, well-drained soil, and fertile ground. A soil pH of 5.8 to 7.0 is ideal."
        },
        {
          "question": "How much water does corn need?",
          "answer": "Corn needs about 20 inches of water throughout its growing season, especially during flowering and kernel formation. Water deeply but avoid soaking the soil excessively."
        },
        {
          "question": "How long does it take for corn to grow?",
          "answer": "Corn typically matures in 60 to 100 days, depending on the variety and climate conditions."
        },
        {
          "question": "When is corn ready to harvest?",
          "answer": "Corn is ready for harvest when the husks turn brown and the kernels are plump and firm. You can also check by pressing a kernel to see if it releases a milky liquid."
        },
        {
          "question": "Should I pollinate corn manually?",
          "answer": "Corn is wind-pollinated, but in smaller gardens, you can shake the stalks gently to ensure good pollination. This helps with kernel development."
        }
      ]
    },
    {
      "name": "Cucumber",
      "image": "../../../assets/Plants/cucumber.png",
      "faqs": [
        {
          "question": "What are the ideal growing conditions for cucumbers?",
          "answer": "Cucumbers grow best in warm temperatures between 21°C and 30°C, with full sunlight and well-drained, loamy soil. A soil pH of 6.0 to 6.5 is ideal."
        },
        {
          "question": "How often should cucumbers be watered?",
          "answer": "Cucumbers require regular watering, especially during the fruiting stage. Water the plants deeply at the base, avoiding overhead watering to reduce the risk of fungal diseases."
        },
        {
          "question": "How long does it take for cucumbers to mature?",
          "answer": "Cucumbers typically mature in 50 to 70 days, depending on the variety. Harvesting early often encourages more fruit production."
        },
        {
          "question": "How can I prevent cucumber beetles?",
          "answer": "To prevent cucumber beetles, use row covers, remove infected plants promptly, and apply insecticidal soap if necessary. Natural predators like ladybugs can also help control the pest."
        }
      ]
    },
    {
      "name": "Garlic",
      "image": "../../../assets/Plants/garlic.png",
      "faqs": [
        {
          "question": "When should garlic be planted?",
          "answer": "Garlic is typically planted in the fall, about 4 to 6 weeks before the first frost, allowing it to establish roots before the winter."
        },
        {
          "question": "What are the ideal growing conditions for garlic?",
          "answer": "Garlic thrives in well-drained, fertile soil with a slightly acidic to neutral pH (around 6.0 to 7.0). It requires full sun exposure to grow properly."
        },
        {
          "question": "How often should garlic be watered?",
          "answer": "Garlic needs moderate watering. Ensure that the soil remains moist but not soaked, especially during the growing period. Reduce watering once the bulbs are nearing maturity."
        },
        {
          "question": "How long does it take to harvest garlic?",
          "answer": "Garlic typically takes 8 to 9 months from planting to harvest. The plants are ready when the lower leaves start to yellow and fall over."
        }
      ]
    },
    {
      "name": "Green Chili",
      "image": "../../../assets/Plants/green-chilli.png",
      "faqs": [
        {
          "question": "What are the ideal growing conditions for green chili?",
          "answer": "Green chili thrives in warm climates with temperatures between 20°C and 30°C, full sunlight, and well-drained fertile soil. The soil should be slightly acidic with a pH between 6.0 and 6.5."
        },
        {
          "question": "How often should green chili plants be watered?",
          "answer": "Green chili plants should be watered 2 to 3 times per week, but avoid overwatering. The soil should remain moist but not soggy."
        },
        {
          "question": "When should I fertilize green chili plants?",
          "answer": "Fertilize chili plants with a balanced fertilizer during early growth. Switch to a phosphorus-rich fertilizer during flowering and fruiting to encourage fruit development."
        },
        {
          "question": "How do I know when green chilies are ready for harvest?",
          "answer": "Green chilies are ready for harvest when they reach their full size and are firm to the touch. Harvest when they are still green, as this is when they have the best flavor."
        }
      ]
    },
        {
          "name": "Lettuce",
          "image": "../../../assets/Plants/lettuce.png",
          "faqs": [
            {
              "question": "What are the ideal growing conditions for lettuce?",
              "answer": "Lettuce grows best in cool temperatures between 10°C and 20°C. It requires full sunlight or partial shade and well-drained, fertile soil with a pH of 6.0 to 6.8."
            },
            {
              "question": "How often should I water lettuce?",
              "answer": "Lettuce needs frequent watering to keep the soil consistently moist. Water deeply once or twice a week depending on the weather."
            },
            {
              "question": "How long does it take for lettuce to mature?",
              "answer": "Lettuce typically matures in 30 to 60 days, depending on the variety and growing conditions."
            },
            {
              "question": "How do I prevent pests on lettuce?",
              "answer": "Lettuce can be susceptible to pests like aphids and slugs. Use organic insecticides or introduce beneficial insects like ladybugs. You can also use row covers to protect plants."
            }
          ]
        },
        {
          "name": "Onion",
          "image": "../../../assets/Plants/onion.png",
          "faqs": [
            {
              "question": "What are the ideal growing conditions for onions?",
              "answer": "Onions thrive in full sunlight with fertile, well-drained soil. The soil pH should be between 6.0 and 7.0. They prefer cooler temperatures early in the growing season."
            },
            {
              "question": "How often should onions be watered?",
              "answer": "Water onions regularly to keep the soil moist, but avoid overwatering. Overwatering can cause bulbs to rot."
            },
            {
              "question": "How long does it take for onions to mature?",
              "answer": "Onions usually take 90 to 120 days to mature, depending on the variety. You can start harvesting when the leaves start to fall over and dry out."
            },
            {
              "question": "What is the best way to store onions?",
              "answer": "Store onions in a cool, dry place with good air circulation. They can last for several months when stored properly."
            }
          ]
        },
        {
          "name": "Peas",
          "image": "../../../assets/Plants/peas.png",
          "faqs": [
            {
              "question": "What are the ideal growing conditions for peas?",
              "answer": "Peas grow best in cool temperatures between 10°C and 18°C. They prefer well-drained, slightly alkaline soil with a pH of 6.0 to 7.5."
            },
            {
              "question": "How often should peas be watered?",
              "answer": "Water peas regularly, especially during flowering and pod formation. Keep the soil moist but not soggy to avoid root rot."
            },
            {
              "question": "How long does it take for peas to mature?",
              "answer": "Peas typically take 60 to 70 days to mature, depending on the variety. Harvest when the pods are full and firm."
            },
            {
              "question": "How do I prevent pests on peas?",
              "answer": "Peas can be affected by aphids, slugs, and pea weevils. Use organic pest control methods, such as neem oil or insecticidal soap, and consider using row covers to protect plants."
            }
          ]
        },
        {
          "name": "Potato",
          "image": "../../../assets/Plants/potato.png",
          "faqs": [
            {
              "question": "What are the ideal growing conditions for potatoes?",
              "answer": "Potatoes require well-drained, loose soil rich in organic matter. They thrive in full sunlight and need a soil pH between 5.0 and 6.5."
            },
            {
              "question": "How often should I water potatoes?",
              "answer": "Potatoes need regular watering, especially during tuber formation. Water deeply and consistently, but avoid overwatering, which can cause the tubers to rot."
            },
            {
              "question": "How long does it take for potatoes to mature?",
              "answer": "Potatoes usually take 70 to 120 days to mature, depending on the variety. Harvest when the foliage dies back and the tubers are firm."
            },
            {
              "question": "How do I prevent pests on potatoes?",
              "answer": "Potatoes can be attacked by pests like the Colorado potato beetle. Regularly inspect plants for signs of damage and use organic pesticides or introduce beneficial insects like ladybugs."
            }
          ]
        },
        {
          "name": "Radish",
          "image": "../../../assets/Plants/radish.png",
          "faqs": [
            {
              "question": "What are the ideal growing conditions for radishes?",
              "answer": "Radishes grow best in cooler temperatures, between 10°C and 18°C. They prefer well-drained, loose soil with a pH of 6.0 to 7.0."
            },
            {
              "question": "How often should I water radishes?",
              "answer": "Radishes need consistent moisture, especially during their early growth stages. Water deeply to ensure that the soil is moist but not soggy."
            },
            {
              "question": "How long does it take for radishes to mature?",
              "answer": "Radishes are one of the fastest-growing vegetables, typically taking 3 to 4 weeks from planting to harvest."
            },
            {
              "question": "How do I prevent pests on radishes?",
              "answer": "Radishes can be affected by aphids, flea beetles, and root maggots. To prevent pests, use row covers and practice crop rotation."
            }
          ]
        },
        {
          "name": "Spinach",
          "image": "../../../assets/Plants/spinach.png",
          "faqs": [
            {
              "question": "What are the ideal growing conditions for spinach?",
              "answer": "Spinach thrives in cooler weather, between 10°C and 20°C. It prefers rich, well-drained soil with a pH of 6.5 to 7.0."
            },
            {
              "question": "How often should I water spinach?",
              "answer": "Spinach requires regular watering to keep the soil consistently moist. Avoid letting the soil dry out, as it can cause the plants to bolt."
            },
            {
              "question": "How long does it take for spinach to mature?",
              "answer": "Spinach typically matures in 40 to 50 days, depending on the variety and growing conditions."
            },
            {
              "question": "How do I prevent pests on spinach?",
              "answer": "Spinach is susceptible to aphids, leaf miners, and snails. Use organic pest control methods like neem oil or insecticidal soap to manage these pests."
            }
          ]
        },
        {
          "name": "Tomato",
          "image": "../../../assets/Plants/tomato.png",
          "faqs": [
            {
              "question": "What are the ideal growing conditions for tomatoes?",
              "answer": "Tomatoes require full sunlight and warm temperatures, between 20°C and 30°C. They prefer well-drained, fertile soil with a pH of 6.2 to 6.8."
            },
            {
              "question": "How often should I water tomatoes?",
              "answer": "Water tomatoes regularly to keep the soil consistently moist. Deep watering is preferred, but avoid overhead watering to reduce the risk of fungal diseases."
            },
            {
              "question": "How long does it take for tomatoes to mature?",
              "answer": "Tomatoes typically take 50 to 85 days to mature, depending on the variety. Harvest when the fruit is fully ripe and has developed its characteristic color."
            },
            {
              "question": "How do I prevent pests on tomatoes?",
              "answer": "Tomatoes are vulnerable to pests like aphids, whiteflies, and hornworms. Use organic pest control methods and regularly check plants for signs of damage."
            }
          ]
        },
        {
          "name": "Wheat",
          "image": "../../../assets/Plants/wheat.png",
          "faqs": [
            {
              "question": "What are the ideal growing conditions for wheat?",
              "answer": "Wheat thrives in cool to moderate temperatures, between 10°C and 24°C. It requires full sunlight and well-drained soil with a pH of 6.0 to 7.0."
            },
            {
              "question": "How often should wheat be watered?",
              "answer": "Wheat requires moderate watering. During the growing season, ensure the soil remains moist, but avoid waterlogging, as excess moisture can lead to disease."
            },
            {
              "question": "How long does it take for wheat to mature?",
              "answer": "Wheat typically takes 4 to 6 months to mature, depending on the variety and weather conditions."
            },
            {
              "question": "When should I harvest wheat?",
              "answer": "Wheat is ready for harvest when the kernels are hard, and the plant has turned golden-brown. Harvest before the kernels begin to shatter."
            }
          ]
        }                        
      ]

  selectedPlant: Plant | null = null;
  flipped = false;
  openFAQIndex: number | null = null;

  onSelectPlant(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const name = target.value;
    this.selectedPlant = this.plants.find(p => p.name === name) || null;
    this.flipped = false;
    this.openFAQIndex = null;
  }
  

  toggleCard(): void {
    this.flipped = !this.flipped;
  }

  toggleFAQ(index: number): void {
    this.openFAQIndex = this.openFAQIndex === index ? null : index;
  }
}
