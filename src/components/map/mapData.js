export const BuildingData1 = {
  "building": {
    "id": "building-1",
    "name": "Tech Office Complex",
    "center": [77.5946, 12.9716],
    "floors": [
      {
        "id": "floor-0",
        "level": 0,
        "name": "Ground Floor",
        "bounds": [
          [77.5944, 12.9714],
          [77.5948, 12.9718]
        ]
      },
      {
        "id": "floor-1",
        "level": 1,
        "name": "First Floor",
        "bounds": [
          [77.5944, 12.9714],
          [77.5948, 12.9718]
        ]
      },
      {
        "id": "floor-2",
        "level": 2,
        "name": "Second Floor",
        "bounds": [
          [77.5944, 12.9714],
          [77.5948, 12.9718]
        ]
      }
    ]
  },
  "floorPlans": [
    {
      "floorId": "floor-0",
      "imageUrl": "/floor-plans/ground-floor.png",
      "bounds": [
        [77.5944, 12.9714],
        [77.5948, 12.9718]
      ],
      "rooms": [
        {
          "id": "room-001",
          "name": "Main Lobby",
          "type": "lobby",
          "coordinates": [77.5946, 12.9716]
        },
        {
          "id": "room-002",
          "name": "Reception",
          "type": "reception",
          "coordinates": [77.59455, 12.97165]
        },
        {
          "id": "room-003",
          "name": "Cafeteria",
          "type": "cafeteria",
          "coordinates": [77.59465, 12.97155]
        }
      ]
    },
    {
      "floorId": "floor-1",
      "imageUrl": "/floor-plans/first-floor.png",
      "bounds": [
        [77.5944, 12.9714],
        [77.5948, 12.9718]
      ],
      "rooms": [
        {
          "id": "room-101",
          "name": "Conference Room A",
          "type": "conference",
          "coordinates": [77.59455, 12.9716]
        },
        {
          "id": "room-102",
          "name": "Meeting Room 1",
          "type": "meeting",
          "coordinates": [77.5946, 12.97165]
        },
        {
          "id": "room-103",
          "name": "Office Space",
          "type": "office",
          "coordinates": [77.59465, 12.9716]
        }
      ]
    },
    {
      "floorId": "floor-2",
      "imageUrl": "/floor-plans/second-floor.png",
      "bounds": [
        [77.5944, 12.9714],
        [77.5948, 12.9718]
      ],
      "rooms": [
        {
          "id": "room-201",
          "name": "Executive Suite",
          "type": "office",
          "coordinates": [77.5946, 12.9716]
        },
        {
          "id": "room-202",
          "name": "Board Room",
          "type": "conference",
          "coordinates": [77.59455, 12.97165]
        },
        {
          "id": "room-203",
          "name": "Break Room",
          "type": "breakroom",
          "coordinates": [77.59465, 12.97155]
        }
      ]
    }
  ],
  "pins": [
    {
      "id": "pin-1",
      "name": "Information Desk",
      "type": "info",
      "floorId": "floor-0",
      "coordinates": [77.59455, 12.97165],
      "icon": "info",
      "description": "Get assistance and directions"
    },
    {
      "id": "pin-2",
      "name": "Emergency Exit",
      "type": "emergency",
      "floorId": "floor-0",
      "coordinates": [77.5944, 12.9714],
      "icon": "emergency",
      "description": "Emergency exit to parking"
    },
    {
      "id": "pin-3",
      "name": "Restroom",
      "type": "restroom",
      "floorId": "floor-0",
      "coordinates": [77.5947, 12.9717],
      "icon": "restroom",
      "description": "Public restrooms"
    },
    {
      "id": "pin-4",
      "name": "Elevator",
      "type": "elevator",
      "floorId": "floor-0",
      "coordinates": [77.59465, 12.97165],
      "icon": "elevator",
      "description": "Access to all floors"
    },
    {
      "id": "pin-5",
      "name": "Coffee Station",
      "type": "amenity",
      "floorId": "floor-1",
      "coordinates": [77.5947, 12.9716],
      "icon": "coffee",
      "description": "Complimentary coffee and tea"
    },
    {
      "id": "pin-6",
      "name": "Printer/Copy Room",
      "type": "utility",
      "floorId": "floor-1",
      "coordinates": [77.5945, 12.9715],
      "icon": "printer",
      "description": "Printing and scanning services"
    },
    {
      "id": "pin-7",
      "name": "Server Room",
      "type": "restricted",
      "floorId": "floor-2",
      "coordinates": [77.5947, 12.9717],
      "icon": "server",
      "description": "Authorized access only"
    },
    {
      "id": "pin-8",
      "name": "Rooftop Access",
      "type": "access",
      "floorId": "floor-2",
      "coordinates": [77.59475, 12.97175],
      "icon": "stairs",
      "description": "Stairs to rooftop terrace"
    }
  ],
  "routes": [
    {
      "id": "route-1",
      "name": "Lobby to Conference Room A",
      "startFloor": "floor-0",
      "endFloor": "floor-1",
      "waypoints": [
        [77.5946, 12.9716],
        [77.59465, 12.97165],
        [77.59455, 12.9716]
      ]
    }
  ]
}




export const BuildingData = {
  "type": "FeatureCollection",
  "metadata": {
    "generated": "2026-02-03T10:19:21.642Z",
    "building": "Tech Campus Complex",
    "total_floors": 10,
    "total_pins": 1000,
    "total_features": 2031,
    "bounds": {
      "minLng": 77.594,
      "minLat": 12.971,
      "maxLng": 77.596,
      "maxLat": 12.972999999999999
    }
  },
  "features": [
    {
      "type": "Feature",
      "properties": {
        "type": "building_outline",
        "name": "Tech Campus Complex",
        "floors": 10,
        "total_height": 40,
        "color": "#1e40af"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.594,
              12.971
            ],
            [
              77.596,
              12.971
            ],
            [
              77.596,
              12.972999999999999
            ],
            [
              77.594,
              12.972999999999999
            ],
            [
              77.594,
              12.971
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "floor",
        "floor": 0,
        "level": 0,
        "name": "Floor 0",
        "base_height": 0,
        "height": 4,
        "color": "#3b82f6",
        "opacity": 0.8
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.594,
              12.971
            ],
            [
              77.596,
              12.971
            ],
            [
              77.596,
              12.972999999999999
            ],
            [
              77.594,
              12.972999999999999
            ],
            [
              77.594,
              12.971
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "floor",
        "floor": 1,
        "level": 1,
        "name": "Floor 1",
        "base_height": 4,
        "height": 8,
        "color": "#2563eb",
        "opacity": 0.8
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.594,
              12.971
            ],
            [
              77.596,
              12.971
            ],
            [
              77.596,
              12.972999999999999
            ],
            [
              77.594,
              12.972999999999999
            ],
            [
              77.594,
              12.971
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "floor",
        "floor": 2,
        "level": 2,
        "name": "Floor 2",
        "base_height": 8,
        "height": 12,
        "color": "#3b82f6",
        "opacity": 0.8
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.594,
              12.971
            ],
            [
              77.596,
              12.971
            ],
            [
              77.596,
              12.972999999999999
            ],
            [
              77.594,
              12.972999999999999
            ],
            [
              77.594,
              12.971
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "floor",
        "floor": 3,
        "level": 3,
        "name": "Floor 3",
        "base_height": 12,
        "height": 16,
        "color": "#2563eb",
        "opacity": 0.8
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.594,
              12.971
            ],
            [
              77.596,
              12.971
            ],
            [
              77.596,
              12.972999999999999
            ],
            [
              77.594,
              12.972999999999999
            ],
            [
              77.594,
              12.971
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "floor",
        "floor": 4,
        "level": 4,
        "name": "Floor 4",
        "base_height": 16,
        "height": 20,
        "color": "#3b82f6",
        "opacity": 0.8
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.594,
              12.971
            ],
            [
              77.596,
              12.971
            ],
            [
              77.596,
              12.972999999999999
            ],
            [
              77.594,
              12.972999999999999
            ],
            [
              77.594,
              12.971
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "floor",
        "floor": 5,
        "level": 5,
        "name": "Floor 5",
        "base_height": 20,
        "height": 24,
        "color": "#2563eb",
        "opacity": 0.8
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.594,
              12.971
            ],
            [
              77.596,
              12.971
            ],
            [
              77.596,
              12.972999999999999
            ],
            [
              77.594,
              12.972999999999999
            ],
            [
              77.594,
              12.971
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "floor",
        "floor": 6,
        "level": 6,
        "name": "Floor 6",
        "base_height": 24,
        "height": 28,
        "color": "#3b82f6",
        "opacity": 0.8
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.594,
              12.971
            ],
            [
              77.596,
              12.971
            ],
            [
              77.596,
              12.972999999999999
            ],
            [
              77.594,
              12.972999999999999
            ],
            [
              77.594,
              12.971
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "floor",
        "floor": 7,
        "level": 7,
        "name": "Floor 7",
        "base_height": 28,
        "height": 32,
        "color": "#2563eb",
        "opacity": 0.8
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.594,
              12.971
            ],
            [
              77.596,
              12.971
            ],
            [
              77.596,
              12.972999999999999
            ],
            [
              77.594,
              12.972999999999999
            ],
            [
              77.594,
              12.971
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "floor",
        "floor": 8,
        "level": 8,
        "name": "Floor 8",
        "base_height": 32,
        "height": 36,
        "color": "#3b82f6",
        "opacity": 0.8
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.594,
              12.971
            ],
            [
              77.596,
              12.971
            ],
            [
              77.596,
              12.972999999999999
            ],
            [
              77.594,
              12.972999999999999
            ],
            [
              77.594,
              12.971
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "floor",
        "floor": 9,
        "level": 9,
        "name": "Floor 9",
        "base_height": 36,
        "height": 40,
        "color": "#2563eb",
        "opacity": 0.8
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.594,
              12.971
            ],
            [
              77.596,
              12.971
            ],
            [
              77.596,
              12.972999999999999
            ],
            [
              77.594,
              12.972999999999999
            ],
            [
              77.594,
              12.971
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "corridor",
        "floor": 0,
        "room_id": "floor0_room0_0",
        "name": "Room 000",
        "color": "#f3f4f6",
        "opacity": 0.5
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.594,
              12.971
            ],
            [
              77.5942,
              12.971
            ],
            [
              77.5942,
              12.9712
            ],
            [
              77.594,
              12.9712
            ],
            [
              77.594,
              12.971
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "utility",
        "floor": 0,
        "room_id": "floor0_room0_1",
        "name": "Room 001",
        "color": "#f1f5f9",
        "opacity": 0.5
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.594,
              12.9712
            ],
            [
              77.5942,
              12.9712
            ],
            [
              77.5942,
              12.9714
            ],
            [
              77.594,
              12.9714
            ],
            [
              77.594,
              12.9712
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "open_office",
        "floor": 0,
        "room_id": "floor0_room0_2",
        "name": "Room 002",
        "color": "#dbeafe",
        "opacity": 0.6
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.594,
              12.971400000000001
            ],
            [
              77.5942,
              12.971400000000001
            ],
            [
              77.5942,
              12.9716
            ],
            [
              77.594,
              12.9716
            ],
            [
              77.594,
              12.971400000000001
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "open_office",
        "floor": 0,
        "room_id": "floor0_room0_3",
        "name": "Room 003",
        "color": "#dbeafe",
        "opacity": 0.6
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.594,
              12.9716
            ],
            [
              77.5942,
              12.9716
            ],
            [
              77.5942,
              12.9718
            ],
            [
              77.594,
              12.9718
            ],
            [
              77.594,
              12.9716
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "corridor",
        "floor": 0,
        "room_id": "floor0_room0_4",
        "name": "Room 004",
        "color": "#f3f4f6",
        "opacity": 0.5
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.594,
              12.9718
            ],
            [
              77.5942,
              12.9718
            ],
            [
              77.5942,
              12.972
            ],
            [
              77.594,
              12.972
            ],
            [
              77.594,
              12.9718
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "corridor",
        "floor": 0,
        "room_id": "floor0_room0_5",
        "name": "Room 005",
        "color": "#f3f4f6",
        "opacity": 0.5
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.594,
              12.972
            ],
            [
              77.5942,
              12.972
            ],
            [
              77.5942,
              12.972199999999999
            ],
            [
              77.594,
              12.972199999999999
            ],
            [
              77.594,
              12.972
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "private_office",
        "floor": 0,
        "room_id": "floor0_room0_6",
        "name": "Room 006",
        "color": "#e0e7ff",
        "opacity": 0.7
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.594,
              12.9722
            ],
            [
              77.5942,
              12.9722
            ],
            [
              77.5942,
              12.9724
            ],
            [
              77.594,
              12.9724
            ],
            [
              77.594,
              12.9722
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "utility",
        "floor": 0,
        "room_id": "floor0_room0_7",
        "name": "Room 007",
        "color": "#f1f5f9",
        "opacity": 0.5
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.594,
              12.9724
            ],
            [
              77.5942,
              12.9724
            ],
            [
              77.5942,
              12.9726
            ],
            [
              77.594,
              12.9726
            ],
            [
              77.594,
              12.9724
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "corridor",
        "floor": 0,
        "room_id": "floor0_room0_8",
        "name": "Room 008",
        "color": "#f3f4f6",
        "opacity": 0.5
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.594,
              12.9726
            ],
            [
              77.5942,
              12.9726
            ],
            [
              77.5942,
              12.9728
            ],
            [
              77.594,
              12.9728
            ],
            [
              77.594,
              12.9726
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "meeting_room",
        "floor": 0,
        "room_id": "floor0_room0_9",
        "name": "Room 009",
        "color": "#fae8ff",
        "opacity": 0.7
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.594,
              12.9728
            ],
            [
              77.5942,
              12.9728
            ],
            [
              77.5942,
              12.972999999999999
            ],
            [
              77.594,
              12.972999999999999
            ],
            [
              77.594,
              12.9728
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "meeting_room",
        "floor": 0,
        "room_id": "floor0_room1_0",
        "name": "Room 010",
        "color": "#fae8ff",
        "opacity": 0.7
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5942,
              12.971
            ],
            [
              77.59440000000001,
              12.971
            ],
            [
              77.59440000000001,
              12.9712
            ],
            [
              77.5942,
              12.9712
            ],
            [
              77.5942,
              12.971
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "open_office",
        "floor": 0,
        "room_id": "floor0_room1_1",
        "name": "Room 011",
        "color": "#dbeafe",
        "opacity": 0.6
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5942,
              12.9712
            ],
            [
              77.59440000000001,
              12.9712
            ],
            [
              77.59440000000001,
              12.9714
            ],
            [
              77.5942,
              12.9714
            ],
            [
              77.5942,
              12.9712
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "private_office",
        "floor": 0,
        "room_id": "floor0_room1_2",
        "name": "Room 012",
        "color": "#e0e7ff",
        "opacity": 0.7
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5942,
              12.971400000000001
            ],
            [
              77.59440000000001,
              12.971400000000001
            ],
            [
              77.59440000000001,
              12.9716
            ],
            [
              77.5942,
              12.9716
            ],
            [
              77.5942,
              12.971400000000001
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "meeting_room",
        "floor": 0,
        "room_id": "floor0_room1_3",
        "name": "Room 013",
        "color": "#fae8ff",
        "opacity": 0.7
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5942,
              12.9716
            ],
            [
              77.59440000000001,
              12.9716
            ],
            [
              77.59440000000001,
              12.9718
            ],
            [
              77.5942,
              12.9718
            ],
            [
              77.5942,
              12.9716
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "open_office",
        "floor": 0,
        "room_id": "floor0_room1_4",
        "name": "Room 014",
        "color": "#dbeafe",
        "opacity": 0.6
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5942,
              12.9718
            ],
            [
              77.59440000000001,
              12.9718
            ],
            [
              77.59440000000001,
              12.972
            ],
            [
              77.5942,
              12.972
            ],
            [
              77.5942,
              12.9718
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "break_room",
        "floor": 0,
        "room_id": "floor0_room1_5",
        "name": "Room 015",
        "color": "#fef3c7",
        "opacity": 0.6
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5942,
              12.972
            ],
            [
              77.59440000000001,
              12.972
            ],
            [
              77.59440000000001,
              12.972199999999999
            ],
            [
              77.5942,
              12.972199999999999
            ],
            [
              77.5942,
              12.972
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "open_office",
        "floor": 0,
        "room_id": "floor0_room1_6",
        "name": "Room 016",
        "color": "#dbeafe",
        "opacity": 0.6
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5942,
              12.9722
            ],
            [
              77.59440000000001,
              12.9722
            ],
            [
              77.59440000000001,
              12.9724
            ],
            [
              77.5942,
              12.9724
            ],
            [
              77.5942,
              12.9722
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "corridor",
        "floor": 0,
        "room_id": "floor0_room1_7",
        "name": "Room 017",
        "color": "#f3f4f6",
        "opacity": 0.5
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5942,
              12.9724
            ],
            [
              77.59440000000001,
              12.9724
            ],
            [
              77.59440000000001,
              12.9726
            ],
            [
              77.5942,
              12.9726
            ],
            [
              77.5942,
              12.9724
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "meeting_room",
        "floor": 0,
        "room_id": "floor0_room1_8",
        "name": "Room 018",
        "color": "#fae8ff",
        "opacity": 0.7
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5942,
              12.9726
            ],
            [
              77.59440000000001,
              12.9726
            ],
            [
              77.59440000000001,
              12.9728
            ],
            [
              77.5942,
              12.9728
            ],
            [
              77.5942,
              12.9726
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "break_room",
        "floor": 0,
        "room_id": "floor0_room1_9",
        "name": "Room 019",
        "color": "#fef3c7",
        "opacity": 0.6
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5942,
              12.9728
            ],
            [
              77.59440000000001,
              12.9728
            ],
            [
              77.59440000000001,
              12.972999999999999
            ],
            [
              77.5942,
              12.972999999999999
            ],
            [
              77.5942,
              12.9728
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "open_office",
        "floor": 0,
        "room_id": "floor0_room2_0",
        "name": "Room 020",
        "color": "#dbeafe",
        "opacity": 0.6
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5944,
              12.971
            ],
            [
              77.5946,
              12.971
            ],
            [
              77.5946,
              12.9712
            ],
            [
              77.5944,
              12.9712
            ],
            [
              77.5944,
              12.971
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "corridor",
        "floor": 0,
        "room_id": "floor0_room2_1",
        "name": "Room 021",
        "color": "#f3f4f6",
        "opacity": 0.5
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5944,
              12.9712
            ],
            [
              77.5946,
              12.9712
            ],
            [
              77.5946,
              12.9714
            ],
            [
              77.5944,
              12.9714
            ],
            [
              77.5944,
              12.9712
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "utility",
        "floor": 0,
        "room_id": "floor0_room2_2",
        "name": "Room 022",
        "color": "#f1f5f9",
        "opacity": 0.5
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5944,
              12.971400000000001
            ],
            [
              77.5946,
              12.971400000000001
            ],
            [
              77.5946,
              12.9716
            ],
            [
              77.5944,
              12.9716
            ],
            [
              77.5944,
              12.971400000000001
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "meeting_room",
        "floor": 0,
        "room_id": "floor0_room2_3",
        "name": "Room 023",
        "color": "#fae8ff",
        "opacity": 0.7
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5944,
              12.9716
            ],
            [
              77.5946,
              12.9716
            ],
            [
              77.5946,
              12.9718
            ],
            [
              77.5944,
              12.9718
            ],
            [
              77.5944,
              12.9716
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "corridor",
        "floor": 0,
        "room_id": "floor0_room2_4",
        "name": "Room 024",
        "color": "#f3f4f6",
        "opacity": 0.5
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5944,
              12.9718
            ],
            [
              77.5946,
              12.9718
            ],
            [
              77.5946,
              12.972
            ],
            [
              77.5944,
              12.972
            ],
            [
              77.5944,
              12.9718
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "meeting_room",
        "floor": 0,
        "room_id": "floor0_room2_5",
        "name": "Room 025",
        "color": "#fae8ff",
        "opacity": 0.7
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5944,
              12.972
            ],
            [
              77.5946,
              12.972
            ],
            [
              77.5946,
              12.972199999999999
            ],
            [
              77.5944,
              12.972199999999999
            ],
            [
              77.5944,
              12.972
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "meeting_room",
        "floor": 0,
        "room_id": "floor0_room2_6",
        "name": "Room 026",
        "color": "#fae8ff",
        "opacity": 0.7
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5944,
              12.9722
            ],
            [
              77.5946,
              12.9722
            ],
            [
              77.5946,
              12.9724
            ],
            [
              77.5944,
              12.9724
            ],
            [
              77.5944,
              12.9722
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "corridor",
        "floor": 0,
        "room_id": "floor0_room2_7",
        "name": "Room 027",
        "color": "#f3f4f6",
        "opacity": 0.5
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5944,
              12.9724
            ],
            [
              77.5946,
              12.9724
            ],
            [
              77.5946,
              12.9726
            ],
            [
              77.5944,
              12.9726
            ],
            [
              77.5944,
              12.9724
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "private_office",
        "floor": 0,
        "room_id": "floor0_room2_8",
        "name": "Room 028",
        "color": "#e0e7ff",
        "opacity": 0.7
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5944,
              12.9726
            ],
            [
              77.5946,
              12.9726
            ],
            [
              77.5946,
              12.9728
            ],
            [
              77.5944,
              12.9728
            ],
            [
              77.5944,
              12.9726
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "open_office",
        "floor": 0,
        "room_id": "floor0_room2_9",
        "name": "Room 029",
        "color": "#dbeafe",
        "opacity": 0.6
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5944,
              12.9728
            ],
            [
              77.5946,
              12.9728
            ],
            [
              77.5946,
              12.972999999999999
            ],
            [
              77.5944,
              12.972999999999999
            ],
            [
              77.5944,
              12.9728
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "private_office",
        "floor": 0,
        "room_id": "floor0_room3_0",
        "name": "Room 030",
        "color": "#e0e7ff",
        "opacity": 0.7
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5946,
              12.971
            ],
            [
              77.5948,
              12.971
            ],
            [
              77.5948,
              12.9712
            ],
            [
              77.5946,
              12.9712
            ],
            [
              77.5946,
              12.971
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "open_office",
        "floor": 0,
        "room_id": "floor0_room3_1",
        "name": "Room 031",
        "color": "#dbeafe",
        "opacity": 0.6
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5946,
              12.9712
            ],
            [
              77.5948,
              12.9712
            ],
            [
              77.5948,
              12.9714
            ],
            [
              77.5946,
              12.9714
            ],
            [
              77.5946,
              12.9712
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "open_office",
        "floor": 0,
        "room_id": "floor0_room3_2",
        "name": "Room 032",
        "color": "#dbeafe",
        "opacity": 0.6
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5946,
              12.971400000000001
            ],
            [
              77.5948,
              12.971400000000001
            ],
            [
              77.5948,
              12.9716
            ],
            [
              77.5946,
              12.9716
            ],
            [
              77.5946,
              12.971400000000001
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "private_office",
        "floor": 0,
        "room_id": "floor0_room3_3",
        "name": "Room 033",
        "color": "#e0e7ff",
        "opacity": 0.7
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5946,
              12.9716
            ],
            [
              77.5948,
              12.9716
            ],
            [
              77.5948,
              12.9718
            ],
            [
              77.5946,
              12.9718
            ],
            [
              77.5946,
              12.9716
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "utility",
        "floor": 0,
        "room_id": "floor0_room3_4",
        "name": "Room 034",
        "color": "#f1f5f9",
        "opacity": 0.5
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5946,
              12.9718
            ],
            [
              77.5948,
              12.9718
            ],
            [
              77.5948,
              12.972
            ],
            [
              77.5946,
              12.972
            ],
            [
              77.5946,
              12.9718
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "corridor",
        "floor": 0,
        "room_id": "floor0_room3_5",
        "name": "Room 035",
        "color": "#f3f4f6",
        "opacity": 0.5
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5946,
              12.972
            ],
            [
              77.5948,
              12.972
            ],
            [
              77.5948,
              12.972199999999999
            ],
            [
              77.5946,
              12.972199999999999
            ],
            [
              77.5946,
              12.972
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "utility",
        "floor": 0,
        "room_id": "floor0_room3_6",
        "name": "Room 036",
        "color": "#f1f5f9",
        "opacity": 0.5
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5946,
              12.9722
            ],
            [
              77.5948,
              12.9722
            ],
            [
              77.5948,
              12.9724
            ],
            [
              77.5946,
              12.9724
            ],
            [
              77.5946,
              12.9722
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "utility",
        "floor": 0,
        "room_id": "floor0_room3_7",
        "name": "Room 037",
        "color": "#f1f5f9",
        "opacity": 0.5
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5946,
              12.9724
            ],
            [
              77.5948,
              12.9724
            ],
            [
              77.5948,
              12.9726
            ],
            [
              77.5946,
              12.9726
            ],
            [
              77.5946,
              12.9724
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "open_office",
        "floor": 0,
        "room_id": "floor0_room3_8",
        "name": "Room 038",
        "color": "#dbeafe",
        "opacity": 0.6
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5946,
              12.9726
            ],
            [
              77.5948,
              12.9726
            ],
            [
              77.5948,
              12.9728
            ],
            [
              77.5946,
              12.9728
            ],
            [
              77.5946,
              12.9726
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "open_office",
        "floor": 0,
        "room_id": "floor0_room3_9",
        "name": "Room 039",
        "color": "#dbeafe",
        "opacity": 0.6
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5946,
              12.9728
            ],
            [
              77.5948,
              12.9728
            ],
            [
              77.5948,
              12.972999999999999
            ],
            [
              77.5946,
              12.972999999999999
            ],
            [
              77.5946,
              12.9728
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "corridor",
        "floor": 0,
        "room_id": "floor0_room4_0",
        "name": "Room 040",
        "color": "#f3f4f6",
        "opacity": 0.5
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.59479999999999,
              12.971
            ],
            [
              77.595,
              12.971
            ],
            [
              77.595,
              12.9712
            ],
            [
              77.59479999999999,
              12.9712
            ],
            [
              77.59479999999999,
              12.971
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "meeting_room",
        "floor": 0,
        "room_id": "floor0_room4_1",
        "name": "Room 041",
        "color": "#fae8ff",
        "opacity": 0.7
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.59479999999999,
              12.9712
            ],
            [
              77.595,
              12.9712
            ],
            [
              77.595,
              12.9714
            ],
            [
              77.59479999999999,
              12.9714
            ],
            [
              77.59479999999999,
              12.9712
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "meeting_room",
        "floor": 0,
        "room_id": "floor0_room4_2",
        "name": "Room 042",
        "color": "#fae8ff",
        "opacity": 0.7
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.59479999999999,
              12.971400000000001
            ],
            [
              77.595,
              12.971400000000001
            ],
            [
              77.595,
              12.9716
            ],
            [
              77.59479999999999,
              12.9716
            ],
            [
              77.59479999999999,
              12.971400000000001
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "meeting_room",
        "floor": 0,
        "room_id": "floor0_room4_3",
        "name": "Room 043",
        "color": "#fae8ff",
        "opacity": 0.7
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.59479999999999,
              12.9716
            ],
            [
              77.595,
              12.9716
            ],
            [
              77.595,
              12.9718
            ],
            [
              77.59479999999999,
              12.9718
            ],
            [
              77.59479999999999,
              12.9716
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "meeting_room",
        "floor": 0,
        "room_id": "floor0_room4_4",
        "name": "Room 044",
        "color": "#fae8ff",
        "opacity": 0.7
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.59479999999999,
              12.9718
            ],
            [
              77.595,
              12.9718
            ],
            [
              77.595,
              12.972
            ],
            [
              77.59479999999999,
              12.972
            ],
            [
              77.59479999999999,
              12.9718
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "meeting_room",
        "floor": 0,
        "room_id": "floor0_room4_5",
        "name": "Room 045",
        "color": "#fae8ff",
        "opacity": 0.7
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.59479999999999,
              12.972
            ],
            [
              77.595,
              12.972
            ],
            [
              77.595,
              12.972199999999999
            ],
            [
              77.59479999999999,
              12.972199999999999
            ],
            [
              77.59479999999999,
              12.972
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "break_room",
        "floor": 0,
        "room_id": "floor0_room4_6",
        "name": "Room 046",
        "color": "#fef3c7",
        "opacity": 0.6
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.59479999999999,
              12.9722
            ],
            [
              77.595,
              12.9722
            ],
            [
              77.595,
              12.9724
            ],
            [
              77.59479999999999,
              12.9724
            ],
            [
              77.59479999999999,
              12.9722
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "private_office",
        "floor": 0,
        "room_id": "floor0_room4_7",
        "name": "Room 047",
        "color": "#e0e7ff",
        "opacity": 0.7
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.59479999999999,
              12.9724
            ],
            [
              77.595,
              12.9724
            ],
            [
              77.595,
              12.9726
            ],
            [
              77.59479999999999,
              12.9726
            ],
            [
              77.59479999999999,
              12.9724
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "meeting_room",
        "floor": 0,
        "room_id": "floor0_room4_8",
        "name": "Room 048",
        "color": "#fae8ff",
        "opacity": 0.7
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.59479999999999,
              12.9726
            ],
            [
              77.595,
              12.9726
            ],
            [
              77.595,
              12.9728
            ],
            [
              77.59479999999999,
              12.9728
            ],
            [
              77.59479999999999,
              12.9726
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "private_office",
        "floor": 0,
        "room_id": "floor0_room4_9",
        "name": "Room 049",
        "color": "#e0e7ff",
        "opacity": 0.7
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.59479999999999,
              12.9728
            ],
            [
              77.595,
              12.9728
            ],
            [
              77.595,
              12.972999999999999
            ],
            [
              77.59479999999999,
              12.972999999999999
            ],
            [
              77.59479999999999,
              12.9728
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "private_office",
        "floor": 0,
        "room_id": "floor0_room5_0",
        "name": "Room 050",
        "color": "#e0e7ff",
        "opacity": 0.7
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.595,
              12.971
            ],
            [
              77.5952,
              12.971
            ],
            [
              77.5952,
              12.9712
            ],
            [
              77.595,
              12.9712
            ],
            [
              77.595,
              12.971
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "break_room",
        "floor": 0,
        "room_id": "floor0_room5_1",
        "name": "Room 051",
        "color": "#fef3c7",
        "opacity": 0.6
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.595,
              12.9712
            ],
            [
              77.5952,
              12.9712
            ],
            [
              77.5952,
              12.9714
            ],
            [
              77.595,
              12.9714
            ],
            [
              77.595,
              12.9712
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "break_room",
        "floor": 0,
        "room_id": "floor0_room5_2",
        "name": "Room 052",
        "color": "#fef3c7",
        "opacity": 0.6
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.595,
              12.971400000000001
            ],
            [
              77.5952,
              12.971400000000001
            ],
            [
              77.5952,
              12.9716
            ],
            [
              77.595,
              12.9716
            ],
            [
              77.595,
              12.971400000000001
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "private_office",
        "floor": 0,
        "room_id": "floor0_room5_3",
        "name": "Room 053",
        "color": "#e0e7ff",
        "opacity": 0.7
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.595,
              12.9716
            ],
            [
              77.5952,
              12.9716
            ],
            [
              77.5952,
              12.9718
            ],
            [
              77.595,
              12.9718
            ],
            [
              77.595,
              12.9716
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "corridor",
        "floor": 0,
        "room_id": "floor0_room5_4",
        "name": "Room 054",
        "color": "#f3f4f6",
        "opacity": 0.5
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.595,
              12.9718
            ],
            [
              77.5952,
              12.9718
            ],
            [
              77.5952,
              12.972
            ],
            [
              77.595,
              12.972
            ],
            [
              77.595,
              12.9718
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "corridor",
        "floor": 0,
        "room_id": "floor0_room5_5",
        "name": "Room 055",
        "color": "#f3f4f6",
        "opacity": 0.5
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.595,
              12.972
            ],
            [
              77.5952,
              12.972
            ],
            [
              77.5952,
              12.972199999999999
            ],
            [
              77.595,
              12.972199999999999
            ],
            [
              77.595,
              12.972
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "meeting_room",
        "floor": 0,
        "room_id": "floor0_room5_6",
        "name": "Room 056",
        "color": "#fae8ff",
        "opacity": 0.7
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.595,
              12.9722
            ],
            [
              77.5952,
              12.9722
            ],
            [
              77.5952,
              12.9724
            ],
            [
              77.595,
              12.9724
            ],
            [
              77.595,
              12.9722
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "corridor",
        "floor": 0,
        "room_id": "floor0_room5_7",
        "name": "Room 057",
        "color": "#f3f4f6",
        "opacity": 0.5
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.595,
              12.9724
            ],
            [
              77.5952,
              12.9724
            ],
            [
              77.5952,
              12.9726
            ],
            [
              77.595,
              12.9726
            ],
            [
              77.595,
              12.9724
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "utility",
        "floor": 0,
        "room_id": "floor0_room5_8",
        "name": "Room 058",
        "color": "#f1f5f9",
        "opacity": 0.5
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.595,
              12.9726
            ],
            [
              77.5952,
              12.9726
            ],
            [
              77.5952,
              12.9728
            ],
            [
              77.595,
              12.9728
            ],
            [
              77.595,
              12.9726
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "corridor",
        "floor": 0,
        "room_id": "floor0_room5_9",
        "name": "Room 059",
        "color": "#f3f4f6",
        "opacity": 0.5
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.595,
              12.9728
            ],
            [
              77.5952,
              12.9728
            ],
            [
              77.5952,
              12.972999999999999
            ],
            [
              77.595,
              12.972999999999999
            ],
            [
              77.595,
              12.9728
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "private_office",
        "floor": 0,
        "room_id": "floor0_room6_0",
        "name": "Room 060",
        "color": "#e0e7ff",
        "opacity": 0.7
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.59519999999999,
              12.971
            ],
            [
              77.5954,
              12.971
            ],
            [
              77.5954,
              12.9712
            ],
            [
              77.59519999999999,
              12.9712
            ],
            [
              77.59519999999999,
              12.971
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "private_office",
        "floor": 0,
        "room_id": "floor0_room6_1",
        "name": "Room 061",
        "color": "#e0e7ff",
        "opacity": 0.7
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.59519999999999,
              12.9712
            ],
            [
              77.5954,
              12.9712
            ],
            [
              77.5954,
              12.9714
            ],
            [
              77.59519999999999,
              12.9714
            ],
            [
              77.59519999999999,
              12.9712
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "break_room",
        "floor": 0,
        "room_id": "floor0_room6_2",
        "name": "Room 062",
        "color": "#fef3c7",
        "opacity": 0.6
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.59519999999999,
              12.971400000000001
            ],
            [
              77.5954,
              12.971400000000001
            ],
            [
              77.5954,
              12.9716
            ],
            [
              77.59519999999999,
              12.9716
            ],
            [
              77.59519999999999,
              12.971400000000001
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "break_room",
        "floor": 0,
        "room_id": "floor0_room6_3",
        "name": "Room 063",
        "color": "#fef3c7",
        "opacity": 0.6
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.59519999999999,
              12.9716
            ],
            [
              77.5954,
              12.9716
            ],
            [
              77.5954,
              12.9718
            ],
            [
              77.59519999999999,
              12.9718
            ],
            [
              77.59519999999999,
              12.9716
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "utility",
        "floor": 0,
        "room_id": "floor0_room6_4",
        "name": "Room 064",
        "color": "#f1f5f9",
        "opacity": 0.5
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.59519999999999,
              12.9718
            ],
            [
              77.5954,
              12.9718
            ],
            [
              77.5954,
              12.972
            ],
            [
              77.59519999999999,
              12.972
            ],
            [
              77.59519999999999,
              12.9718
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "open_office",
        "floor": 0,
        "room_id": "floor0_room6_5",
        "name": "Room 065",
        "color": "#dbeafe",
        "opacity": 0.6
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.59519999999999,
              12.972
            ],
            [
              77.5954,
              12.972
            ],
            [
              77.5954,
              12.972199999999999
            ],
            [
              77.59519999999999,
              12.972199999999999
            ],
            [
              77.59519999999999,
              12.972
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "break_room",
        "floor": 0,
        "room_id": "floor0_room6_6",
        "name": "Room 066",
        "color": "#fef3c7",
        "opacity": 0.6
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.59519999999999,
              12.9722
            ],
            [
              77.5954,
              12.9722
            ],
            [
              77.5954,
              12.9724
            ],
            [
              77.59519999999999,
              12.9724
            ],
            [
              77.59519999999999,
              12.9722
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "meeting_room",
        "floor": 0,
        "room_id": "floor0_room6_7",
        "name": "Room 067",
        "color": "#fae8ff",
        "opacity": 0.7
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.59519999999999,
              12.9724
            ],
            [
              77.5954,
              12.9724
            ],
            [
              77.5954,
              12.9726
            ],
            [
              77.59519999999999,
              12.9726
            ],
            [
              77.59519999999999,
              12.9724
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "utility",
        "floor": 0,
        "room_id": "floor0_room6_8",
        "name": "Room 068",
        "color": "#f1f5f9",
        "opacity": 0.5
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.59519999999999,
              12.9726
            ],
            [
              77.5954,
              12.9726
            ],
            [
              77.5954,
              12.9728
            ],
            [
              77.59519999999999,
              12.9728
            ],
            [
              77.59519999999999,
              12.9726
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "corridor",
        "floor": 0,
        "room_id": "floor0_room6_9",
        "name": "Room 069",
        "color": "#f3f4f6",
        "opacity": 0.5
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.59519999999999,
              12.9728
            ],
            [
              77.5954,
              12.9728
            ],
            [
              77.5954,
              12.972999999999999
            ],
            [
              77.59519999999999,
              12.972999999999999
            ],
            [
              77.59519999999999,
              12.9728
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "meeting_room",
        "floor": 0,
        "room_id": "floor0_room7_0",
        "name": "Room 070",
        "color": "#fae8ff",
        "opacity": 0.7
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5954,
              12.971
            ],
            [
              77.5956,
              12.971
            ],
            [
              77.5956,
              12.9712
            ],
            [
              77.5954,
              12.9712
            ],
            [
              77.5954,
              12.971
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "private_office",
        "floor": 0,
        "room_id": "floor0_room7_1",
        "name": "Room 071",
        "color": "#e0e7ff",
        "opacity": 0.7
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5954,
              12.9712
            ],
            [
              77.5956,
              12.9712
            ],
            [
              77.5956,
              12.9714
            ],
            [
              77.5954,
              12.9714
            ],
            [
              77.5954,
              12.9712
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "break_room",
        "floor": 0,
        "room_id": "floor0_room7_2",
        "name": "Room 072",
        "color": "#fef3c7",
        "opacity": 0.6
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5954,
              12.971400000000001
            ],
            [
              77.5956,
              12.971400000000001
            ],
            [
              77.5956,
              12.9716
            ],
            [
              77.5954,
              12.9716
            ],
            [
              77.5954,
              12.971400000000001
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "corridor",
        "floor": 0,
        "room_id": "floor0_room7_3",
        "name": "Room 073",
        "color": "#f3f4f6",
        "opacity": 0.5
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5954,
              12.9716
            ],
            [
              77.5956,
              12.9716
            ],
            [
              77.5956,
              12.9718
            ],
            [
              77.5954,
              12.9718
            ],
            [
              77.5954,
              12.9716
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "open_office",
        "floor": 0,
        "room_id": "floor0_room7_4",
        "name": "Room 074",
        "color": "#dbeafe",
        "opacity": 0.6
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5954,
              12.9718
            ],
            [
              77.5956,
              12.9718
            ],
            [
              77.5956,
              12.972
            ],
            [
              77.5954,
              12.972
            ],
            [
              77.5954,
              12.9718
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "corridor",
        "floor": 0,
        "room_id": "floor0_room7_5",
        "name": "Room 075",
        "color": "#f3f4f6",
        "opacity": 0.5
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5954,
              12.972
            ],
            [
              77.5956,
              12.972
            ],
            [
              77.5956,
              12.972199999999999
            ],
            [
              77.5954,
              12.972199999999999
            ],
            [
              77.5954,
              12.972
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "corridor",
        "floor": 0,
        "room_id": "floor0_room7_6",
        "name": "Room 076",
        "color": "#f3f4f6",
        "opacity": 0.5
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5954,
              12.9722
            ],
            [
              77.5956,
              12.9722
            ],
            [
              77.5956,
              12.9724
            ],
            [
              77.5954,
              12.9724
            ],
            [
              77.5954,
              12.9722
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "private_office",
        "floor": 0,
        "room_id": "floor0_room7_7",
        "name": "Room 077",
        "color": "#e0e7ff",
        "opacity": 0.7
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5954,
              12.9724
            ],
            [
              77.5956,
              12.9724
            ],
            [
              77.5956,
              12.9726
            ],
            [
              77.5954,
              12.9726
            ],
            [
              77.5954,
              12.9724
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "corridor",
        "floor": 0,
        "room_id": "floor0_room7_8",
        "name": "Room 078",
        "color": "#f3f4f6",
        "opacity": 0.5
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5954,
              12.9726
            ],
            [
              77.5956,
              12.9726
            ],
            [
              77.5956,
              12.9728
            ],
            [
              77.5954,
              12.9728
            ],
            [
              77.5954,
              12.9726
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "open_office",
        "floor": 0,
        "room_id": "floor0_room7_9",
        "name": "Room 079",
        "color": "#dbeafe",
        "opacity": 0.6
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5954,
              12.9728
            ],
            [
              77.5956,
              12.9728
            ],
            [
              77.5956,
              12.972999999999999
            ],
            [
              77.5954,
              12.972999999999999
            ],
            [
              77.5954,
              12.9728
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "break_room",
        "floor": 0,
        "room_id": "floor0_room8_0",
        "name": "Room 080",
        "color": "#fef3c7",
        "opacity": 0.6
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.59559999999999,
              12.971
            ],
            [
              77.5958,
              12.971
            ],
            [
              77.5958,
              12.9712
            ],
            [
              77.59559999999999,
              12.9712
            ],
            [
              77.59559999999999,
              12.971
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "meeting_room",
        "floor": 0,
        "room_id": "floor0_room8_1",
        "name": "Room 081",
        "color": "#fae8ff",
        "opacity": 0.7
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.59559999999999,
              12.9712
            ],
            [
              77.5958,
              12.9712
            ],
            [
              77.5958,
              12.9714
            ],
            [
              77.59559999999999,
              12.9714
            ],
            [
              77.59559999999999,
              12.9712
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "open_office",
        "floor": 0,
        "room_id": "floor0_room8_2",
        "name": "Room 082",
        "color": "#dbeafe",
        "opacity": 0.6
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.59559999999999,
              12.971400000000001
            ],
            [
              77.5958,
              12.971400000000001
            ],
            [
              77.5958,
              12.9716
            ],
            [
              77.59559999999999,
              12.9716
            ],
            [
              77.59559999999999,
              12.971400000000001
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "corridor",
        "floor": 0,
        "room_id": "floor0_room8_3",
        "name": "Room 083",
        "color": "#f3f4f6",
        "opacity": 0.5
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.59559999999999,
              12.9716
            ],
            [
              77.5958,
              12.9716
            ],
            [
              77.5958,
              12.9718
            ],
            [
              77.59559999999999,
              12.9718
            ],
            [
              77.59559999999999,
              12.9716
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "corridor",
        "floor": 0,
        "room_id": "floor0_room8_4",
        "name": "Room 084",
        "color": "#f3f4f6",
        "opacity": 0.5
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.59559999999999,
              12.9718
            ],
            [
              77.5958,
              12.9718
            ],
            [
              77.5958,
              12.972
            ],
            [
              77.59559999999999,
              12.972
            ],
            [
              77.59559999999999,
              12.9718
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "utility",
        "floor": 0,
        "room_id": "floor0_room8_5",
        "name": "Room 085",
        "color": "#f1f5f9",
        "opacity": 0.5
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.59559999999999,
              12.972
            ],
            [
              77.5958,
              12.972
            ],
            [
              77.5958,
              12.972199999999999
            ],
            [
              77.59559999999999,
              12.972199999999999
            ],
            [
              77.59559999999999,
              12.972
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "open_office",
        "floor": 0,
        "room_id": "floor0_room8_6",
        "name": "Room 086",
        "color": "#dbeafe",
        "opacity": 0.6
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.59559999999999,
              12.9722
            ],
            [
              77.5958,
              12.9722
            ],
            [
              77.5958,
              12.9724
            ],
            [
              77.59559999999999,
              12.9724
            ],
            [
              77.59559999999999,
              12.9722
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "private_office",
        "floor": 0,
        "room_id": "floor0_room8_7",
        "name": "Room 087",
        "color": "#e0e7ff",
        "opacity": 0.7
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.59559999999999,
              12.9724
            ],
            [
              77.5958,
              12.9724
            ],
            [
              77.5958,
              12.9726
            ],
            [
              77.59559999999999,
              12.9726
            ],
            [
              77.59559999999999,
              12.9724
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "corridor",
        "floor": 0,
        "room_id": "floor0_room8_8",
        "name": "Room 088",
        "color": "#f3f4f6",
        "opacity": 0.5
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.59559999999999,
              12.9726
            ],
            [
              77.5958,
              12.9726
            ],
            [
              77.5958,
              12.9728
            ],
            [
              77.59559999999999,
              12.9728
            ],
            [
              77.59559999999999,
              12.9726
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "utility",
        "floor": 0,
        "room_id": "floor0_room8_9",
        "name": "Room 089",
        "color": "#f1f5f9",
        "opacity": 0.5
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.59559999999999,
              12.9728
            ],
            [
              77.5958,
              12.9728
            ],
            [
              77.5958,
              12.972999999999999
            ],
            [
              77.59559999999999,
              12.972999999999999
            ],
            [
              77.59559999999999,
              12.9728
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "break_room",
        "floor": 0,
        "room_id": "floor0_room9_0",
        "name": "Room 090",
        "color": "#fef3c7",
        "opacity": 0.6
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5958,
              12.971
            ],
            [
              77.596,
              12.971
            ],
            [
              77.596,
              12.9712
            ],
            [
              77.5958,
              12.9712
            ],
            [
              77.5958,
              12.971
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "break_room",
        "floor": 0,
        "room_id": "floor0_room9_1",
        "name": "Room 091",
        "color": "#fef3c7",
        "opacity": 0.6
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5958,
              12.9712
            ],
            [
              77.596,
              12.9712
            ],
            [
              77.596,
              12.9714
            ],
            [
              77.5958,
              12.9714
            ],
            [
              77.5958,
              12.9712
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "utility",
        "floor": 0,
        "room_id": "floor0_room9_2",
        "name": "Room 092",
        "color": "#f1f5f9",
        "opacity": 0.5
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5958,
              12.971400000000001
            ],
            [
              77.596,
              12.971400000000001
            ],
            [
              77.596,
              12.9716
            ],
            [
              77.5958,
              12.9716
            ],
            [
              77.5958,
              12.971400000000001
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "open_office",
        "floor": 0,
        "room_id": "floor0_room9_3",
        "name": "Room 093",
        "color": "#dbeafe",
        "opacity": 0.6
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5958,
              12.9716
            ],
            [
              77.596,
              12.9716
            ],
            [
              77.596,
              12.9718
            ],
            [
              77.5958,
              12.9718
            ],
            [
              77.5958,
              12.9716
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "private_office",
        "floor": 0,
        "room_id": "floor0_room9_4",
        "name": "Room 094",
        "color": "#e0e7ff",
        "opacity": 0.7
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5958,
              12.9718
            ],
            [
              77.596,
              12.9718
            ],
            [
              77.596,
              12.972
            ],
            [
              77.5958,
              12.972
            ],
            [
              77.5958,
              12.9718
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "meeting_room",
        "floor": 0,
        "room_id": "floor0_room9_5",
        "name": "Room 095",
        "color": "#fae8ff",
        "opacity": 0.7
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5958,
              12.972
            ],
            [
              77.596,
              12.972
            ],
            [
              77.596,
              12.972199999999999
            ],
            [
              77.5958,
              12.972199999999999
            ],
            [
              77.5958,
              12.972
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "utility",
        "floor": 0,
        "room_id": "floor0_room9_6",
        "name": "Room 096",
        "color": "#f1f5f9",
        "opacity": 0.5
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5958,
              12.9722
            ],
            [
              77.596,
              12.9722
            ],
            [
              77.596,
              12.9724
            ],
            [
              77.5958,
              12.9724
            ],
            [
              77.5958,
              12.9722
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "corridor",
        "floor": 0,
        "room_id": "floor0_room9_7",
        "name": "Room 097",
        "color": "#f3f4f6",
        "opacity": 0.5
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5958,
              12.9724
            ],
            [
              77.596,
              12.9724
            ],
            [
              77.596,
              12.9726
            ],
            [
              77.5958,
              12.9726
            ],
            [
              77.5958,
              12.9724
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "utility",
        "floor": 0,
        "room_id": "floor0_room9_8",
        "name": "Room 098",
        "color": "#f1f5f9",
        "opacity": 0.5
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5958,
              12.9726
            ],
            [
              77.596,
              12.9726
            ],
            [
              77.596,
              12.9728
            ],
            [
              77.5958,
              12.9728
            ],
            [
              77.5958,
              12.9726
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "utility",
        "floor": 0,
        "room_id": "floor0_room9_9",
        "name": "Room 099",
        "color": "#f1f5f9",
        "opacity": 0.5
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5958,
              12.9728
            ],
            [
              77.596,
              12.9728
            ],
            [
              77.596,
              12.972999999999999
            ],
            [
              77.5958,
              12.972999999999999
            ],
            [
              77.5958,
              12.9728
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "utility",
        "floor": 1,
        "room_id": "floor1_room0_0",
        "name": "Room 100",
        "color": "#f1f5f9",
        "opacity": 0.5
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.594,
              12.971
            ],
            [
              77.5942,
              12.971
            ],
            [
              77.5942,
              12.9712
            ],
            [
              77.594,
              12.9712
            ],
            [
              77.594,
              12.971
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "private_office",
        "floor": 1,
        "room_id": "floor1_room0_1",
        "name": "Room 101",
        "color": "#e0e7ff",
        "opacity": 0.7
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.594,
              12.9712
            ],
            [
              77.5942,
              12.9712
            ],
            [
              77.5942,
              12.9714
            ],
            [
              77.594,
              12.9714
            ],
            [
              77.594,
              12.9712
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "meeting_room",
        "floor": 1,
        "room_id": "floor1_room0_2",
        "name": "Room 102",
        "color": "#fae8ff",
        "opacity": 0.7
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.594,
              12.971400000000001
            ],
            [
              77.5942,
              12.971400000000001
            ],
            [
              77.5942,
              12.9716
            ],
            [
              77.594,
              12.9716
            ],
            [
              77.594,
              12.971400000000001
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "open_office",
        "floor": 1,
        "room_id": "floor1_room0_3",
        "name": "Room 103",
        "color": "#dbeafe",
        "opacity": 0.6
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.594,
              12.9716
            ],
            [
              77.5942,
              12.9716
            ],
            [
              77.5942,
              12.9718
            ],
            [
              77.594,
              12.9718
            ],
            [
              77.594,
              12.9716
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "open_office",
        "floor": 1,
        "room_id": "floor1_room0_4",
        "name": "Room 104",
        "color": "#dbeafe",
        "opacity": 0.6
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.594,
              12.9718
            ],
            [
              77.5942,
              12.9718
            ],
            [
              77.5942,
              12.972
            ],
            [
              77.594,
              12.972
            ],
            [
              77.594,
              12.9718
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "meeting_room",
        "floor": 1,
        "room_id": "floor1_room0_5",
        "name": "Room 105",
        "color": "#fae8ff",
        "opacity": 0.7
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.594,
              12.972
            ],
            [
              77.5942,
              12.972
            ],
            [
              77.5942,
              12.972199999999999
            ],
            [
              77.594,
              12.972199999999999
            ],
            [
              77.594,
              12.972
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "private_office",
        "floor": 1,
        "room_id": "floor1_room0_6",
        "name": "Room 106",
        "color": "#e0e7ff",
        "opacity": 0.7
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.594,
              12.9722
            ],
            [
              77.5942,
              12.9722
            ],
            [
              77.5942,
              12.9724
            ],
            [
              77.594,
              12.9724
            ],
            [
              77.594,
              12.9722
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "private_office",
        "floor": 1,
        "room_id": "floor1_room0_7",
        "name": "Room 107",
        "color": "#e0e7ff",
        "opacity": 0.7
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.594,
              12.9724
            ],
            [
              77.5942,
              12.9724
            ],
            [
              77.5942,
              12.9726
            ],
            [
              77.594,
              12.9726
            ],
            [
              77.594,
              12.9724
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "private_office",
        "floor": 1,
        "room_id": "floor1_room0_8",
        "name": "Room 108",
        "color": "#e0e7ff",
        "opacity": 0.7
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.594,
              12.9726
            ],
            [
              77.5942,
              12.9726
            ],
            [
              77.5942,
              12.9728
            ],
            [
              77.594,
              12.9728
            ],
            [
              77.594,
              12.9726
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "open_office",
        "floor": 1,
        "room_id": "floor1_room0_9",
        "name": "Room 109",
        "color": "#dbeafe",
        "opacity": 0.6
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.594,
              12.9728
            ],
            [
              77.5942,
              12.9728
            ],
            [
              77.5942,
              12.972999999999999
            ],
            [
              77.594,
              12.972999999999999
            ],
            [
              77.594,
              12.9728
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "corridor",
        "floor": 1,
        "room_id": "floor1_room1_0",
        "name": "Room 110",
        "color": "#f3f4f6",
        "opacity": 0.5
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5942,
              12.971
            ],
            [
              77.59440000000001,
              12.971
            ],
            [
              77.59440000000001,
              12.9712
            ],
            [
              77.5942,
              12.9712
            ],
            [
              77.5942,
              12.971
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "private_office",
        "floor": 1,
        "room_id": "floor1_room1_1",
        "name": "Room 111",
        "color": "#e0e7ff",
        "opacity": 0.7
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5942,
              12.9712
            ],
            [
              77.59440000000001,
              12.9712
            ],
            [
              77.59440000000001,
              12.9714
            ],
            [
              77.5942,
              12.9714
            ],
            [
              77.5942,
              12.9712
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "utility",
        "floor": 1,
        "room_id": "floor1_room1_2",
        "name": "Room 112",
        "color": "#f1f5f9",
        "opacity": 0.5
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5942,
              12.971400000000001
            ],
            [
              77.59440000000001,
              12.971400000000001
            ],
            [
              77.59440000000001,
              12.9716
            ],
            [
              77.5942,
              12.9716
            ],
            [
              77.5942,
              12.971400000000001
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "corridor",
        "floor": 1,
        "room_id": "floor1_room1_3",
        "name": "Room 113",
        "color": "#f3f4f6",
        "opacity": 0.5
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5942,
              12.9716
            ],
            [
              77.59440000000001,
              12.9716
            ],
            [
              77.59440000000001,
              12.9718
            ],
            [
              77.5942,
              12.9718
            ],
            [
              77.5942,
              12.9716
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "open_office",
        "floor": 1,
        "room_id": "floor1_room1_4",
        "name": "Room 114",
        "color": "#dbeafe",
        "opacity": 0.6
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5942,
              12.9718
            ],
            [
              77.59440000000001,
              12.9718
            ],
            [
              77.59440000000001,
              12.972
            ],
            [
              77.5942,
              12.972
            ],
            [
              77.5942,
              12.9718
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "meeting_room",
        "floor": 1,
        "room_id": "floor1_room1_5",
        "name": "Room 115",
        "color": "#fae8ff",
        "opacity": 0.7
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5942,
              12.972
            ],
            [
              77.59440000000001,
              12.972
            ],
            [
              77.59440000000001,
              12.972199999999999
            ],
            [
              77.5942,
              12.972199999999999
            ],
            [
              77.5942,
              12.972
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "break_room",
        "floor": 1,
        "room_id": "floor1_room1_6",
        "name": "Room 116",
        "color": "#fef3c7",
        "opacity": 0.6
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5942,
              12.9722
            ],
            [
              77.59440000000001,
              12.9722
            ],
            [
              77.59440000000001,
              12.9724
            ],
            [
              77.5942,
              12.9724
            ],
            [
              77.5942,
              12.9722
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "meeting_room",
        "floor": 1,
        "room_id": "floor1_room1_7",
        "name": "Room 117",
        "color": "#fae8ff",
        "opacity": 0.7
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5942,
              12.9724
            ],
            [
              77.59440000000001,
              12.9724
            ],
            [
              77.59440000000001,
              12.9726
            ],
            [
              77.5942,
              12.9726
            ],
            [
              77.5942,
              12.9724
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "private_office",
        "floor": 1,
        "room_id": "floor1_room1_8",
        "name": "Room 118",
        "color": "#e0e7ff",
        "opacity": 0.7
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5942,
              12.9726
            ],
            [
              77.59440000000001,
              12.9726
            ],
            [
              77.59440000000001,
              12.9728
            ],
            [
              77.5942,
              12.9728
            ],
            [
              77.5942,
              12.9726
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "utility",
        "floor": 1,
        "room_id": "floor1_room1_9",
        "name": "Room 119",
        "color": "#f1f5f9",
        "opacity": 0.5
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5942,
              12.9728
            ],
            [
              77.59440000000001,
              12.9728
            ],
            [
              77.59440000000001,
              12.972999999999999
            ],
            [
              77.5942,
              12.972999999999999
            ],
            [
              77.5942,
              12.9728
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "meeting_room",
        "floor": 1,
        "room_id": "floor1_room2_0",
        "name": "Room 120",
        "color": "#fae8ff",
        "opacity": 0.7
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5944,
              12.971
            ],
            [
              77.5946,
              12.971
            ],
            [
              77.5946,
              12.9712
            ],
            [
              77.5944,
              12.9712
            ],
            [
              77.5944,
              12.971
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "corridor",
        "floor": 1,
        "room_id": "floor1_room2_1",
        "name": "Room 121",
        "color": "#f3f4f6",
        "opacity": 0.5
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5944,
              12.9712
            ],
            [
              77.5946,
              12.9712
            ],
            [
              77.5946,
              12.9714
            ],
            [
              77.5944,
              12.9714
            ],
            [
              77.5944,
              12.9712
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "break_room",
        "floor": 1,
        "room_id": "floor1_room2_2",
        "name": "Room 122",
        "color": "#fef3c7",
        "opacity": 0.6
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5944,
              12.971400000000001
            ],
            [
              77.5946,
              12.971400000000001
            ],
            [
              77.5946,
              12.9716
            ],
            [
              77.5944,
              12.9716
            ],
            [
              77.5944,
              12.971400000000001
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "meeting_room",
        "floor": 1,
        "room_id": "floor1_room2_3",
        "name": "Room 123",
        "color": "#fae8ff",
        "opacity": 0.7
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5944,
              12.9716
            ],
            [
              77.5946,
              12.9716
            ],
            [
              77.5946,
              12.9718
            ],
            [
              77.5944,
              12.9718
            ],
            [
              77.5944,
              12.9716
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "meeting_room",
        "floor": 1,
        "room_id": "floor1_room2_4",
        "name": "Room 124",
        "color": "#fae8ff",
        "opacity": 0.7
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5944,
              12.9718
            ],
            [
              77.5946,
              12.9718
            ],
            [
              77.5946,
              12.972
            ],
            [
              77.5944,
              12.972
            ],
            [
              77.5944,
              12.9718
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "corridor",
        "floor": 1,
        "room_id": "floor1_room2_5",
        "name": "Room 125",
        "color": "#f3f4f6",
        "opacity": 0.5
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5944,
              12.972
            ],
            [
              77.5946,
              12.972
            ],
            [
              77.5946,
              12.972199999999999
            ],
            [
              77.5944,
              12.972199999999999
            ],
            [
              77.5944,
              12.972
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "private_office",
        "floor": 1,
        "room_id": "floor1_room2_6",
        "name": "Room 126",
        "color": "#e0e7ff",
        "opacity": 0.7
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5944,
              12.9722
            ],
            [
              77.5946,
              12.9722
            ],
            [
              77.5946,
              12.9724
            ],
            [
              77.5944,
              12.9724
            ],
            [
              77.5944,
              12.9722
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "meeting_room",
        "floor": 1,
        "room_id": "floor1_room2_7",
        "name": "Room 127",
        "color": "#fae8ff",
        "opacity": 0.7
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5944,
              12.9724
            ],
            [
              77.5946,
              12.9724
            ],
            [
              77.5946,
              12.9726
            ],
            [
              77.5944,
              12.9726
            ],
            [
              77.5944,
              12.9724
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "break_room",
        "floor": 1,
        "room_id": "floor1_room2_8",
        "name": "Room 128",
        "color": "#fef3c7",
        "opacity": 0.6
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5944,
              12.9726
            ],
            [
              77.5946,
              12.9726
            ],
            [
              77.5946,
              12.9728
            ],
            [
              77.5944,
              12.9728
            ],
            [
              77.5944,
              12.9726
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "utility",
        "floor": 1,
        "room_id": "floor1_room2_9",
        "name": "Room 129",
        "color": "#f1f5f9",
        "opacity": 0.5
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5944,
              12.9728
            ],
            [
              77.5946,
              12.9728
            ],
            [
              77.5946,
              12.972999999999999
            ],
            [
              77.5944,
              12.972999999999999
            ],
            [
              77.5944,
              12.9728
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "corridor",
        "floor": 1,
        "room_id": "floor1_room3_0",
        "name": "Room 130",
        "color": "#f3f4f6",
        "opacity": 0.5
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5946,
              12.971
            ],
            [
              77.5948,
              12.971
            ],
            [
              77.5948,
              12.9712
            ],
            [
              77.5946,
              12.9712
            ],
            [
              77.5946,
              12.971
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "break_room",
        "floor": 1,
        "room_id": "floor1_room3_1",
        "name": "Room 131",
        "color": "#fef3c7",
        "opacity": 0.6
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5946,
              12.9712
            ],
            [
              77.5948,
              12.9712
            ],
            [
              77.5948,
              12.9714
            ],
            [
              77.5946,
              12.9714
            ],
            [
              77.5946,
              12.9712
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "utility",
        "floor": 1,
        "room_id": "floor1_room3_2",
        "name": "Room 132",
        "color": "#f1f5f9",
        "opacity": 0.5
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5946,
              12.971400000000001
            ],
            [
              77.5948,
              12.971400000000001
            ],
            [
              77.5948,
              12.9716
            ],
            [
              77.5946,
              12.9716
            ],
            [
              77.5946,
              12.971400000000001
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "private_office",
        "floor": 1,
        "room_id": "floor1_room3_3",
        "name": "Room 133",
        "color": "#e0e7ff",
        "opacity": 0.7
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5946,
              12.9716
            ],
            [
              77.5948,
              12.9716
            ],
            [
              77.5948,
              12.9718
            ],
            [
              77.5946,
              12.9718
            ],
            [
              77.5946,
              12.9716
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "corridor",
        "floor": 1,
        "room_id": "floor1_room3_4",
        "name": "Room 134",
        "color": "#f3f4f6",
        "opacity": 0.5
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5946,
              12.9718
            ],
            [
              77.5948,
              12.9718
            ],
            [
              77.5948,
              12.972
            ],
            [
              77.5946,
              12.972
            ],
            [
              77.5946,
              12.9718
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "open_office",
        "floor": 1,
        "room_id": "floor1_room3_5",
        "name": "Room 135",
        "color": "#dbeafe",
        "opacity": 0.6
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5946,
              12.972
            ],
            [
              77.5948,
              12.972
            ],
            [
              77.5948,
              12.972199999999999
            ],
            [
              77.5946,
              12.972199999999999
            ],
            [
              77.5946,
              12.972
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "corridor",
        "floor": 1,
        "room_id": "floor1_room3_6",
        "name": "Room 136",
        "color": "#f3f4f6",
        "opacity": 0.5
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5946,
              12.9722
            ],
            [
              77.5948,
              12.9722
            ],
            [
              77.5948,
              12.9724
            ],
            [
              77.5946,
              12.9724
            ],
            [
              77.5946,
              12.9722
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "private_office",
        "floor": 1,
        "room_id": "floor1_room3_7",
        "name": "Room 137",
        "color": "#e0e7ff",
        "opacity": 0.7
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5946,
              12.9724
            ],
            [
              77.5948,
              12.9724
            ],
            [
              77.5948,
              12.9726
            ],
            [
              77.5946,
              12.9726
            ],
            [
              77.5946,
              12.9724
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "open_office",
        "floor": 1,
        "room_id": "floor1_room3_8",
        "name": "Room 138",
        "color": "#dbeafe",
        "opacity": 0.6
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5946,
              12.9726
            ],
            [
              77.5948,
              12.9726
            ],
            [
              77.5948,
              12.9728
            ],
            [
              77.5946,
              12.9728
            ],
            [
              77.5946,
              12.9726
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "meeting_room",
        "floor": 1,
        "room_id": "floor1_room3_9",
        "name": "Room 139",
        "color": "#fae8ff",
        "opacity": 0.7
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5946,
              12.9728
            ],
            [
              77.5948,
              12.9728
            ],
            [
              77.5948,
              12.972999999999999
            ],
            [
              77.5946,
              12.972999999999999
            ],
            [
              77.5946,
              12.9728
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "private_office",
        "floor": 1,
        "room_id": "floor1_room4_0",
        "name": "Room 140",
        "color": "#e0e7ff",
        "opacity": 0.7
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.59479999999999,
              12.971
            ],
            [
              77.595,
              12.971
            ],
            [
              77.595,
              12.9712
            ],
            [
              77.59479999999999,
              12.9712
            ],
            [
              77.59479999999999,
              12.971
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "break_room",
        "floor": 1,
        "room_id": "floor1_room4_1",
        "name": "Room 141",
        "color": "#fef3c7",
        "opacity": 0.6
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.59479999999999,
              12.9712
            ],
            [
              77.595,
              12.9712
            ],
            [
              77.595,
              12.9714
            ],
            [
              77.59479999999999,
              12.9714
            ],
            [
              77.59479999999999,
              12.9712
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "open_office",
        "floor": 1,
        "room_id": "floor1_room4_2",
        "name": "Room 142",
        "color": "#dbeafe",
        "opacity": 0.6
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.59479999999999,
              12.971400000000001
            ],
            [
              77.595,
              12.971400000000001
            ],
            [
              77.595,
              12.9716
            ],
            [
              77.59479999999999,
              12.9716
            ],
            [
              77.59479999999999,
              12.971400000000001
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "utility",
        "floor": 1,
        "room_id": "floor1_room4_3",
        "name": "Room 143",
        "color": "#f1f5f9",
        "opacity": 0.5
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.59479999999999,
              12.9716
            ],
            [
              77.595,
              12.9716
            ],
            [
              77.595,
              12.9718
            ],
            [
              77.59479999999999,
              12.9718
            ],
            [
              77.59479999999999,
              12.9716
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "open_office",
        "floor": 1,
        "room_id": "floor1_room4_4",
        "name": "Room 144",
        "color": "#dbeafe",
        "opacity": 0.6
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.59479999999999,
              12.9718
            ],
            [
              77.595,
              12.9718
            ],
            [
              77.595,
              12.972
            ],
            [
              77.59479999999999,
              12.972
            ],
            [
              77.59479999999999,
              12.9718
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "utility",
        "floor": 1,
        "room_id": "floor1_room4_5",
        "name": "Room 145",
        "color": "#f1f5f9",
        "opacity": 0.5
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.59479999999999,
              12.972
            ],
            [
              77.595,
              12.972
            ],
            [
              77.595,
              12.972199999999999
            ],
            [
              77.59479999999999,
              12.972199999999999
            ],
            [
              77.59479999999999,
              12.972
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "break_room",
        "floor": 1,
        "room_id": "floor1_room4_6",
        "name": "Room 146",
        "color": "#fef3c7",
        "opacity": 0.6
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.59479999999999,
              12.9722
            ],
            [
              77.595,
              12.9722
            ],
            [
              77.595,
              12.9724
            ],
            [
              77.59479999999999,
              12.9724
            ],
            [
              77.59479999999999,
              12.9722
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "break_room",
        "floor": 1,
        "room_id": "floor1_room4_7",
        "name": "Room 147",
        "color": "#fef3c7",
        "opacity": 0.6
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.59479999999999,
              12.9724
            ],
            [
              77.595,
              12.9724
            ],
            [
              77.595,
              12.9726
            ],
            [
              77.59479999999999,
              12.9726
            ],
            [
              77.59479999999999,
              12.9724
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "corridor",
        "floor": 1,
        "room_id": "floor1_room4_8",
        "name": "Room 148",
        "color": "#f3f4f6",
        "opacity": 0.5
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.59479999999999,
              12.9726
            ],
            [
              77.595,
              12.9726
            ],
            [
              77.595,
              12.9728
            ],
            [
              77.59479999999999,
              12.9728
            ],
            [
              77.59479999999999,
              12.9726
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "private_office",
        "floor": 1,
        "room_id": "floor1_room4_9",
        "name": "Room 149",
        "color": "#e0e7ff",
        "opacity": 0.7
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.59479999999999,
              12.9728
            ],
            [
              77.595,
              12.9728
            ],
            [
              77.595,
              12.972999999999999
            ],
            [
              77.59479999999999,
              12.972999999999999
            ],
            [
              77.59479999999999,
              12.9728
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "meeting_room",
        "floor": 1,
        "room_id": "floor1_room5_0",
        "name": "Room 150",
        "color": "#fae8ff",
        "opacity": 0.7
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.595,
              12.971
            ],
            [
              77.5952,
              12.971
            ],
            [
              77.5952,
              12.9712
            ],
            [
              77.595,
              12.9712
            ],
            [
              77.595,
              12.971
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "meeting_room",
        "floor": 1,
        "room_id": "floor1_room5_1",
        "name": "Room 151",
        "color": "#fae8ff",
        "opacity": 0.7
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.595,
              12.9712
            ],
            [
              77.5952,
              12.9712
            ],
            [
              77.5952,
              12.9714
            ],
            [
              77.595,
              12.9714
            ],
            [
              77.595,
              12.9712
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "private_office",
        "floor": 1,
        "room_id": "floor1_room5_2",
        "name": "Room 152",
        "color": "#e0e7ff",
        "opacity": 0.7
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.595,
              12.971400000000001
            ],
            [
              77.5952,
              12.971400000000001
            ],
            [
              77.5952,
              12.9716
            ],
            [
              77.595,
              12.9716
            ],
            [
              77.595,
              12.971400000000001
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "break_room",
        "floor": 1,
        "room_id": "floor1_room5_3",
        "name": "Room 153",
        "color": "#fef3c7",
        "opacity": 0.6
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.595,
              12.9716
            ],
            [
              77.5952,
              12.9716
            ],
            [
              77.5952,
              12.9718
            ],
            [
              77.595,
              12.9718
            ],
            [
              77.595,
              12.9716
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "meeting_room",
        "floor": 1,
        "room_id": "floor1_room5_4",
        "name": "Room 154",
        "color": "#fae8ff",
        "opacity": 0.7
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.595,
              12.9718
            ],
            [
              77.5952,
              12.9718
            ],
            [
              77.5952,
              12.972
            ],
            [
              77.595,
              12.972
            ],
            [
              77.595,
              12.9718
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "corridor",
        "floor": 1,
        "room_id": "floor1_room5_5",
        "name": "Room 155",
        "color": "#f3f4f6",
        "opacity": 0.5
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.595,
              12.972
            ],
            [
              77.5952,
              12.972
            ],
            [
              77.5952,
              12.972199999999999
            ],
            [
              77.595,
              12.972199999999999
            ],
            [
              77.595,
              12.972
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "meeting_room",
        "floor": 1,
        "room_id": "floor1_room5_6",
        "name": "Room 156",
        "color": "#fae8ff",
        "opacity": 0.7
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.595,
              12.9722
            ],
            [
              77.5952,
              12.9722
            ],
            [
              77.5952,
              12.9724
            ],
            [
              77.595,
              12.9724
            ],
            [
              77.595,
              12.9722
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "break_room",
        "floor": 1,
        "room_id": "floor1_room5_7",
        "name": "Room 157",
        "color": "#fef3c7",
        "opacity": 0.6
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.595,
              12.9724
            ],
            [
              77.5952,
              12.9724
            ],
            [
              77.5952,
              12.9726
            ],
            [
              77.595,
              12.9726
            ],
            [
              77.595,
              12.9724
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "open_office",
        "floor": 1,
        "room_id": "floor1_room5_8",
        "name": "Room 158",
        "color": "#dbeafe",
        "opacity": 0.6
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.595,
              12.9726
            ],
            [
              77.5952,
              12.9726
            ],
            [
              77.5952,
              12.9728
            ],
            [
              77.595,
              12.9728
            ],
            [
              77.595,
              12.9726
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "break_room",
        "floor": 1,
        "room_id": "floor1_room5_9",
        "name": "Room 159",
        "color": "#fef3c7",
        "opacity": 0.6
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.595,
              12.9728
            ],
            [
              77.5952,
              12.9728
            ],
            [
              77.5952,
              12.972999999999999
            ],
            [
              77.595,
              12.972999999999999
            ],
            [
              77.595,
              12.9728
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "break_room",
        "floor": 1,
        "room_id": "floor1_room6_0",
        "name": "Room 160",
        "color": "#fef3c7",
        "opacity": 0.6
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.59519999999999,
              12.971
            ],
            [
              77.5954,
              12.971
            ],
            [
              77.5954,
              12.9712
            ],
            [
              77.59519999999999,
              12.9712
            ],
            [
              77.59519999999999,
              12.971
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "corridor",
        "floor": 1,
        "room_id": "floor1_room6_1",
        "name": "Room 161",
        "color": "#f3f4f6",
        "opacity": 0.5
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.59519999999999,
              12.9712
            ],
            [
              77.5954,
              12.9712
            ],
            [
              77.5954,
              12.9714
            ],
            [
              77.59519999999999,
              12.9714
            ],
            [
              77.59519999999999,
              12.9712
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "corridor",
        "floor": 1,
        "room_id": "floor1_room6_2",
        "name": "Room 162",
        "color": "#f3f4f6",
        "opacity": 0.5
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.59519999999999,
              12.971400000000001
            ],
            [
              77.5954,
              12.971400000000001
            ],
            [
              77.5954,
              12.9716
            ],
            [
              77.59519999999999,
              12.9716
            ],
            [
              77.59519999999999,
              12.971400000000001
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "meeting_room",
        "floor": 1,
        "room_id": "floor1_room6_3",
        "name": "Room 163",
        "color": "#fae8ff",
        "opacity": 0.7
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.59519999999999,
              12.9716
            ],
            [
              77.5954,
              12.9716
            ],
            [
              77.5954,
              12.9718
            ],
            [
              77.59519999999999,
              12.9718
            ],
            [
              77.59519999999999,
              12.9716
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "corridor",
        "floor": 1,
        "room_id": "floor1_room6_4",
        "name": "Room 164",
        "color": "#f3f4f6",
        "opacity": 0.5
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.59519999999999,
              12.9718
            ],
            [
              77.5954,
              12.9718
            ],
            [
              77.5954,
              12.972
            ],
            [
              77.59519999999999,
              12.972
            ],
            [
              77.59519999999999,
              12.9718
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "meeting_room",
        "floor": 1,
        "room_id": "floor1_room6_5",
        "name": "Room 165",
        "color": "#fae8ff",
        "opacity": 0.7
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.59519999999999,
              12.972
            ],
            [
              77.5954,
              12.972
            ],
            [
              77.5954,
              12.972199999999999
            ],
            [
              77.59519999999999,
              12.972199999999999
            ],
            [
              77.59519999999999,
              12.972
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "break_room",
        "floor": 1,
        "room_id": "floor1_room6_6",
        "name": "Room 166",
        "color": "#fef3c7",
        "opacity": 0.6
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.59519999999999,
              12.9722
            ],
            [
              77.5954,
              12.9722
            ],
            [
              77.5954,
              12.9724
            ],
            [
              77.59519999999999,
              12.9724
            ],
            [
              77.59519999999999,
              12.9722
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "meeting_room",
        "floor": 1,
        "room_id": "floor1_room6_7",
        "name": "Room 167",
        "color": "#fae8ff",
        "opacity": 0.7
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.59519999999999,
              12.9724
            ],
            [
              77.5954,
              12.9724
            ],
            [
              77.5954,
              12.9726
            ],
            [
              77.59519999999999,
              12.9726
            ],
            [
              77.59519999999999,
              12.9724
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "utility",
        "floor": 1,
        "room_id": "floor1_room6_8",
        "name": "Room 168",
        "color": "#f1f5f9",
        "opacity": 0.5
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.59519999999999,
              12.9726
            ],
            [
              77.5954,
              12.9726
            ],
            [
              77.5954,
              12.9728
            ],
            [
              77.59519999999999,
              12.9728
            ],
            [
              77.59519999999999,
              12.9726
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "break_room",
        "floor": 1,
        "room_id": "floor1_room6_9",
        "name": "Room 169",
        "color": "#fef3c7",
        "opacity": 0.6
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.59519999999999,
              12.9728
            ],
            [
              77.5954,
              12.9728
            ],
            [
              77.5954,
              12.972999999999999
            ],
            [
              77.59519999999999,
              12.972999999999999
            ],
            [
              77.59519999999999,
              12.9728
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "meeting_room",
        "floor": 1,
        "room_id": "floor1_room7_0",
        "name": "Room 170",
        "color": "#fae8ff",
        "opacity": 0.7
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5954,
              12.971
            ],
            [
              77.5956,
              12.971
            ],
            [
              77.5956,
              12.9712
            ],
            [
              77.5954,
              12.9712
            ],
            [
              77.5954,
              12.971
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "utility",
        "floor": 1,
        "room_id": "floor1_room7_1",
        "name": "Room 171",
        "color": "#f1f5f9",
        "opacity": 0.5
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5954,
              12.9712
            ],
            [
              77.5956,
              12.9712
            ],
            [
              77.5956,
              12.9714
            ],
            [
              77.5954,
              12.9714
            ],
            [
              77.5954,
              12.9712
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "corridor",
        "floor": 1,
        "room_id": "floor1_room7_2",
        "name": "Room 172",
        "color": "#f3f4f6",
        "opacity": 0.5
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5954,
              12.971400000000001
            ],
            [
              77.5956,
              12.971400000000001
            ],
            [
              77.5956,
              12.9716
            ],
            [
              77.5954,
              12.9716
            ],
            [
              77.5954,
              12.971400000000001
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "open_office",
        "floor": 1,
        "room_id": "floor1_room7_3",
        "name": "Room 173",
        "color": "#dbeafe",
        "opacity": 0.6
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5954,
              12.9716
            ],
            [
              77.5956,
              12.9716
            ],
            [
              77.5956,
              12.9718
            ],
            [
              77.5954,
              12.9718
            ],
            [
              77.5954,
              12.9716
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "utility",
        "floor": 1,
        "room_id": "floor1_room7_4",
        "name": "Room 174",
        "color": "#f1f5f9",
        "opacity": 0.5
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5954,
              12.9718
            ],
            [
              77.5956,
              12.9718
            ],
            [
              77.5956,
              12.972
            ],
            [
              77.5954,
              12.972
            ],
            [
              77.5954,
              12.9718
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "utility",
        "floor": 1,
        "room_id": "floor1_room7_5",
        "name": "Room 175",
        "color": "#f1f5f9",
        "opacity": 0.5
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5954,
              12.972
            ],
            [
              77.5956,
              12.972
            ],
            [
              77.5956,
              12.972199999999999
            ],
            [
              77.5954,
              12.972199999999999
            ],
            [
              77.5954,
              12.972
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "open_office",
        "floor": 1,
        "room_id": "floor1_room7_6",
        "name": "Room 176",
        "color": "#dbeafe",
        "opacity": 0.6
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5954,
              12.9722
            ],
            [
              77.5956,
              12.9722
            ],
            [
              77.5956,
              12.9724
            ],
            [
              77.5954,
              12.9724
            ],
            [
              77.5954,
              12.9722
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "utility",
        "floor": 1,
        "room_id": "floor1_room7_7",
        "name": "Room 177",
        "color": "#f1f5f9",
        "opacity": 0.5
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5954,
              12.9724
            ],
            [
              77.5956,
              12.9724
            ],
            [
              77.5956,
              12.9726
            ],
            [
              77.5954,
              12.9726
            ],
            [
              77.5954,
              12.9724
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "corridor",
        "floor": 1,
        "room_id": "floor1_room7_8",
        "name": "Room 178",
        "color": "#f3f4f6",
        "opacity": 0.5
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5954,
              12.9726
            ],
            [
              77.5956,
              12.9726
            ],
            [
              77.5956,
              12.9728
            ],
            [
              77.5954,
              12.9728
            ],
            [
              77.5954,
              12.9726
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "meeting_room",
        "floor": 1,
        "room_id": "floor1_room7_9",
        "name": "Room 179",
        "color": "#fae8ff",
        "opacity": 0.7
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5954,
              12.9728
            ],
            [
              77.5956,
              12.9728
            ],
            [
              77.5956,
              12.972999999999999
            ],
            [
              77.5954,
              12.972999999999999
            ],
            [
              77.5954,
              12.9728
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "private_office",
        "floor": 1,
        "room_id": "floor1_room8_0",
        "name": "Room 180",
        "color": "#e0e7ff",
        "opacity": 0.7
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.59559999999999,
              12.971
            ],
            [
              77.5958,
              12.971
            ],
            [
              77.5958,
              12.9712
            ],
            [
              77.59559999999999,
              12.9712
            ],
            [
              77.59559999999999,
              12.971
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "utility",
        "floor": 1,
        "room_id": "floor1_room8_1",
        "name": "Room 181",
        "color": "#f1f5f9",
        "opacity": 0.5
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.59559999999999,
              12.9712
            ],
            [
              77.5958,
              12.9712
            ],
            [
              77.5958,
              12.9714
            ],
            [
              77.59559999999999,
              12.9714
            ],
            [
              77.59559999999999,
              12.9712
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "break_room",
        "floor": 1,
        "room_id": "floor1_room8_2",
        "name": "Room 182",
        "color": "#fef3c7",
        "opacity": 0.6
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.59559999999999,
              12.971400000000001
            ],
            [
              77.5958,
              12.971400000000001
            ],
            [
              77.5958,
              12.9716
            ],
            [
              77.59559999999999,
              12.9716
            ],
            [
              77.59559999999999,
              12.971400000000001
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "private_office",
        "floor": 1,
        "room_id": "floor1_room8_3",
        "name": "Room 183",
        "color": "#e0e7ff",
        "opacity": 0.7
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.59559999999999,
              12.9716
            ],
            [
              77.5958,
              12.9716
            ],
            [
              77.5958,
              12.9718
            ],
            [
              77.59559999999999,
              12.9718
            ],
            [
              77.59559999999999,
              12.9716
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "utility",
        "floor": 1,
        "room_id": "floor1_room8_4",
        "name": "Room 184",
        "color": "#f1f5f9",
        "opacity": 0.5
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.59559999999999,
              12.9718
            ],
            [
              77.5958,
              12.9718
            ],
            [
              77.5958,
              12.972
            ],
            [
              77.59559999999999,
              12.972
            ],
            [
              77.59559999999999,
              12.9718
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "utility",
        "floor": 1,
        "room_id": "floor1_room8_5",
        "name": "Room 185",
        "color": "#f1f5f9",
        "opacity": 0.5
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.59559999999999,
              12.972
            ],
            [
              77.5958,
              12.972
            ],
            [
              77.5958,
              12.972199999999999
            ],
            [
              77.59559999999999,
              12.972199999999999
            ],
            [
              77.59559999999999,
              12.972
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "utility",
        "floor": 1,
        "room_id": "floor1_room8_6",
        "name": "Room 186",
        "color": "#f1f5f9",
        "opacity": 0.5
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.59559999999999,
              12.9722
            ],
            [
              77.5958,
              12.9722
            ],
            [
              77.5958,
              12.9724
            ],
            [
              77.59559999999999,
              12.9724
            ],
            [
              77.59559999999999,
              12.9722
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "meeting_room",
        "floor": 1,
        "room_id": "floor1_room8_7",
        "name": "Room 187",
        "color": "#fae8ff",
        "opacity": 0.7
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.59559999999999,
              12.9724
            ],
            [
              77.5958,
              12.9724
            ],
            [
              77.5958,
              12.9726
            ],
            [
              77.59559999999999,
              12.9726
            ],
            [
              77.59559999999999,
              12.9724
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "open_office",
        "floor": 1,
        "room_id": "floor1_room8_8",
        "name": "Room 188",
        "color": "#dbeafe",
        "opacity": 0.6
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.59559999999999,
              12.9726
            ],
            [
              77.5958,
              12.9726
            ],
            [
              77.5958,
              12.9728
            ],
            [
              77.59559999999999,
              12.9728
            ],
            [
              77.59559999999999,
              12.9726
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "meeting_room",
        "floor": 1,
        "room_id": "floor1_room8_9",
        "name": "Room 189",
        "color": "#fae8ff",
        "opacity": 0.7
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.59559999999999,
              12.9728
            ],
            [
              77.5958,
              12.9728
            ],
            [
              77.5958,
              12.972999999999999
            ],
            [
              77.59559999999999,
              12.972999999999999
            ],
            [
              77.59559999999999,
              12.9728
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "break_room",
        "floor": 1,
        "room_id": "floor1_room9_0",
        "name": "Room 190",
        "color": "#fef3c7",
        "opacity": 0.6
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5958,
              12.971
            ],
            [
              77.596,
              12.971
            ],
            [
              77.596,
              12.9712
            ],
            [
              77.5958,
              12.9712
            ],
            [
              77.5958,
              12.971
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "room_type": "open_office",
        "floor": 1,
        "room_id": "floor1_room9_1",
        "name": "Room 191",
        "color": "#dbeafe",
        "opacity": 0.6
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              77.5958,
              12.9712
            ],
            [
              77.596,
              12.9712
            ],
            [
              77.596,
              12.9714
            ],
            [
              77.5958,
              12.9714
            ],
            [
              77.5958,
              12.9712
            ]
          ]
        ]
      }
    },
    
    {
      "type": "Feature",
      "properties": {
        "type": "pin",
        "pin_type": "workstation",
        "id": "pin_1000",
        "name": "workstation 1000",
        "description": "workstation on floor 8",
        "floor": 8,
        "level": 8,
        "icon": "💻",
        "color": "#3b82f6",
        "height": 33,
        "category": "workstation"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [
          77.59487195740837,
          12.97161421149889,
          33
        ]
      }
    }
  ],
  "statistics": {
    "total_pins": 1000,
    "by_type": {
      "meeting_room": 153,
      "stairs": 57,
      "printer": 56,
      "restroom": 89,
      "workstation": 414,
      "elevator": 49,
      "storage": 20,
      "phone_booth": 38,
      "security": 11,
      "conference": 33,
      "lobby": 9,
      "cafeteria": 21,
      "emergency_exit": 26,
      "server_room": 6,
      "lounge": 18
    },
    "by_floor": {
      "0": 200,
      "1": 100,
      "2": 100,
      "3": 100,
      "4": 100,
      "5": 100,
      "6": 100,
      "7": 100,
      "8": 100
    }
  }
}



// api - project/{id}
// project/155
export const ProjectData = {
  // "location": [153.0278190319704, -27.467322438114287],
  "location": [75.78044926997217, 11.258814157509704],
  "enc_id": 155,
  "enc_customer_id": 13,
  "project_name": "savad floorplan test",
  "logo": null,
  "background_color": "#F6F7F3",
  "fill_color": "#EFEEEC",
  "border_thick": 3,
  "border_color": "#D3D3D3",
  "inactive_color": "#B2B2B2",
  "location_color": "#26A3DB",
  "product_color": "#F2C538",
  "start_color": "#5FD827",
  "beacon_color": "#26A3DB",
  "amenity_color": "#9440C6",
  "safety_color": "#ED1C24",
  "level_change_color": "#374046",
  "navigation_color": "#E52525",
  "nav_btn_color": null,
  "nav_btn_text_color": null,
  "navigation_thick": 3,
  "is_published": 0,
  "status": 1,
  "is_paid": 0,
  "error_reporting_email": null,
  "published_date": null,
  "recurring_date": null,
  "is_free": 1,
  "is_basic": 0,
  "is_additional": 0,
  "additional_count": 0,
  "is_pass_protected": false,
  "vt_details": [],
  "fp_details": []
}

export const FloorList = [
  {
    name:"basement",
    id : 0
  },
  {
    name:"floor 1",
    id : 1
  },
  {
    name:"floor 2",
    id : 2
  },
  {
    name:"floor 3",
    id : 3
  },
]


export const floorDataResponse = {
  features : [
    {
      "type": "Feature",
      "properties": {
        "type": "pin",
        "pin_type": "workstation",
        "id": "pin_1000",
        "name": "workstation 1000",
        "description": "workstation on floor 8",
        "floor": 0,
        "level": 0,
        "icon": "💻",
        "color": "#3b82f6",
        "height": 33,
        "category": "workstation"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [75.7799, 11.2593]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "pin",
        "pin_type": "workstation",
        "id": "pin_1000",
        "name": "workstation 1000",
        "description": "workstation on floor 8",
        "floor": 0,
        "level": 0,
        "icon": "💻",
        "color": "#3b82f6",
        "height": 33,
        "category": "workstation"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [75.7809, 11.2593]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "pin",
        "pin_type": "workstation",
        "id": "pin_1000",
        "name": "workstation 1000",
        "description": "workstation on floor 8",
        "floor": 0,
        "level": 0,
        "icon": "💻",
        "color": "#3b82f6",
        "height": 33,
        "category": "workstation"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [75.7809, 11.2583]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "pin",
        "pin_type": "workstation",
        "id": "pin_1000",
        "name": "workstation 1000",
        "description": "workstation on floor 8",
        "floor": 0,
        "level": 0,
        "icon": "💻",
        "color": "#3b82f6",
        "height": 33,
        "category": "workstation"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [75.7799, 11.2583]
      }
    },
  ]
}


export const demoMarkersGeoJSON = 
// {}
// {
//   "type": "FeatureCollection",
//   "features": [
//     {
//       "type": "Feature",
//       "properties": {
//         'id':1,
//         "category": "location",
//         "title": "Main Entrance",
//         "iconPath": "/icons/location/entrance.svg",
//         "iconSize": [30, 30],
//         "description": "Main entry point to the building"
//       },
//       "geometry": {
//         "type": "Point",
//         "coordinates": [75.77973749437209 , 11.258567192627964]
//       }
//     },
//     {
//       "type": "Feature",
//       "properties": {
//         'id':2,
//         "category": "beacon",
//         "subType": "strong",
//         "title": "Beacon A1",
//         "iconPath": "/icons/beacon/beacon.svg",
//         "iconSize": [25, 25],
//         "description": "Navigation beacon with strong signal"
//       },
//       "geometry": {
//         "type": "Point",
//         "coordinates": [75.78020956315851 , 11.25864084921831]
//       }
//     },
//     {
//       "type": "Feature",
//       "properties": {
//         'id':3,
//         "category": "amenity",
//         "subType": "restroom",
//         "title": "Restroom - Ground Floor",
//         "iconPath": "/icons/amenity/restroom.svg",
//         "iconSize": [28, 28],
//         "description": "Clean and accessible restroom facility"
//       },
//       "geometry": {
//         "type": "Point",
//         "coordinates": [75.78032489814612 , 11.258417248796505]
//       }
//     },
//     {
//       "type": "Feature",
//       "properties": {
//         'id':4,
//         "category": "amenity",
//         "subType": "food_court",
//         "title": "Food Court",
//         "iconPath": "/icons/amenity/food.svg",
//         "iconSize": [28, 28],
//         "description": "Various food options available"
//       },
//       "geometry": {
//         "type": "Point",
//         "coordinates": [75.77982744021458 , 11.258189516968073]
//       }
//     },
//     {
//       "type": "Feature",
//       "properties": {
//         'id':5,
//         "category": "safety",
//         "subType": "fire_extinguisher",
//         "title": "Fire Extinguisher A1",
//         "iconPath": "/icons/safety/fire_extinguisher.svg",
//         "iconSize": [25, 25],
//         "description": "Emergency fire safety equipment"
//       },
//       "geometry": {
//         "type": "Point",
//         "coordinates": [75.7801961521144 , 11.258909169495027]
//       }
//     },
//     {
//       "type": "Feature",
//       "properties": {
//         'id':6,
//         "category": "safety",
//         "subType": "first_aid",
//         "title": "First Aid Station",
//         "iconPath": "/icons/safety/first_aid.svg",
//         "iconSize": [25, 25],
//         "description": "Medical emergency supplies"
//       },
//       "geometry": {
//         "type": "Point",
//         "coordinates": [11.258909169495027, 11.258867080056461]
//       }
//     },
//     {
//       "type": "Feature",
//       "properties": {
//         'id':7,
//         "category": "product",
//         "title": "Product Display - Zone A",
//         "iconPath": "/icons/product/display.svg",
//         "iconSize": [32, 32],
//         "description": "Featured products showcase"
//       },
//       "geometry": {
//         "type": "Point",
//         "coordinates": [75.78029271163857, 11.258154189254398]
//       }
//     },
//     {
//       "type": "Feature",
//       "properties": {
//         'id':8,
//         "category": "vertical_transport",
//         "subType": "elevator",
//         "title": "Elevator 1",
//         "iconPath": "/icons/vertical_transport/elevator.svg",
//         "iconSize": [30, 30],
//         "description": "Access to all floors"
//       },
//       "geometry": {
//         "type": "Point",
//         "coordinates": [75.78005667724534 , 11.258325177984418]
//       }
//     },
//     {
//       "type": "Feature",
//       "properties": {
//         'id':9,
//         "category": "vertical_transport",
//         "subType": "escalator",
//         "title": "Escalator to Level 2",
//         "iconPath": "/icons/vertical_transport/escalator.svg",
//         "iconSize": [30, 30],
//         "description": "Moving staircase to upper level"
//       },
//       "geometry": {
//         "type": "Point",
//         "coordinates": [75.77966239251964 , 11.258333069769364]
//       }
//     },
//     {
//       "type": "Feature",
//       "properties": {
//         'id':10,
//         "category": "location",
//         "title": "Information Desk",
//         "iconPath": "/icons/location/info.svg",
//         "iconSize": [30, 30],
//         "description": "Customer service and information"
//       },
//       "geometry": {
//         "type": "Point",
//         "coordinates": [75.77982868947836 , 11.258840774153981]
//       }
//     }
//   ]
// };

[
  {
    "category" : "location",
    "enc_id": 4069,
    "location_name": "! New location",
    "positions": "{\"x\": 75.78006705510748, \"y\": 11.25875758837445}",
    "tags": null,
    "description": null,
    "monday_open": 0,
    "monday_start": null,
    "monday_end": null,
    "tuesday_open": 0,
    "tuesday_start": null,
    "tuesday_end": null,
    "wednesday_open": 0,
    "wednesday_start": null,
    "wednesday_end": null,
    "thursday_open": 0,
    "thursday_start": null,
    "thursday_end": null,
    "friday_open": 0,
    "friday_start": null,
    "friday_end": null,
    "saturday_open": 0,
    "saturday_start": null,
    "saturday_end": null,
    "sunday_open": 0,
    "sunday_start": null,
    "sunday_end": null,
    "contact": null,
    "website": "[]",
    "promotions": "[]",
    "location_color": "#26A3DB",
    "boundary_color": null,
    "boundary_attributes": null,
    "is_published": 0,
    "discard": 1,
    "publish": 1,
    "display_index": 20,
    "status": 1,
    "is_copy": 0,
    "created_at": "2026-02-10T06:25:54.000000Z",
    "updated_at": "2026-02-10T07:58:25.000000Z",
    "deleted_at": null,
    "floor_plan": "Level 1",
    "fp_id": 409
  }
]

export const demoBuildingData = {
  "type": "FeatureCollection",
  "features": [ 
    {
      "type": "Feature",
      "properties": {
        "type": "building",
        "name": "Main Building",
        "floor": 0,
        "category": "building",
        "fillColor": "#e5e7eb",
        "fillOpacity": 0.3,
        "strokeColor": "#374151",
        "strokeWidth": 2,
        "height": 0
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [75.7800, 11.2585],
            [75.7818, 11.2585],
            [75.7818, 11.2598],
            [75.7800, 11.2598],
            [75.7800, 11.2585]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "name": "Conference Room A",
        "floor": 0,
        "category": "room",
        "subCategory": "conference",
        "fillColor": "#dbeafe",
        "fillOpacity": 0.5,
        "strokeColor": "#3b82f6",
        "strokeWidth": 1.5,
        "description": "Main conference room with capacity for 20 people"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [75.7804, 11.2589],
            [75.7808, 11.2589],
            [75.7808, 11.2592],
            [75.7804, 11.2592],
            [75.7804, 11.2589]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "room",
        "name": "Server Room",
        "floor": 0,
        "category": "room",
        "subCategory": "technical",
        "fillColor": "#fef3c7",
        "fillOpacity": 0.5,
        "strokeColor": "#f59e0b",
        "strokeWidth": 1.5,
        "description": "Restricted access - Server infrastructure"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [75.7809, 11.2590],
            [75.7812, 11.2590],
            [75.7812, 11.2593],
            [75.7809, 11.2593],
            [75.7809, 11.2590]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "type": "walkway",
        "name": "Main Corridor",
        "floor": 0,
        "category": "walkway",
        "fillColor": "#f9fafb",
        "fillOpacity": 0.8,
        "strokeColor": "#9ca3af",
        "strokeWidth": 1,
        "dashArray": [5, 5]
      },
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [75.7804, 11.2590],
          [75.7815, 11.2590]
        ]
      }
    }
  ]
};




