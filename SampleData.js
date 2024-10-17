const product = {
    "name": "iPhone 12 pro max 256gb",
    "thumb": "https://example.com/images/tshirt.jpg",
    "description": "Best device",
    "price": 1000,
    "discount_price": 350,
    "quantity": 100,
    "category": ["id"], // Replace with an actual ObjectId from your category collection
    "attributes": [
        "Id"
    ],
    "ratingAverage": 4.7,
    "variations": [{
            "images": ["https://example.com/images/iphone-red.jpg", "https://example.com/images/iphone-red.jpg"],
            "name": "Màu",
            "options": ["red", "blue"]
        },
        {
            "images": [],
            "name": "Dung lượng",
            "options": ["128GB", "256GB", "512GB", "1TB"]
        }
    ],
    "isDraft": false,
    "isPublished": true,
    "sku_list": [{
        "sku_index": [0, 1], // red - 128gb 
        "sku_price": 1101,
        "sku_stock": 10,
    }, {
        "sku_index": [0, 2],
        "sku_price": 1103,
        "sku_stock": 10,
    }, {
        "sku_index": [1, 0],
        "sku_price": 1104,
        "sku_stock": 10,
    }]
}

const categories = [{
        "name": "iPhone",
        "description": "Apple's line of smartphones",
        "parentId": null
    },
    {
        "name": "Mac",
        "description": "Apple's line of personal computers",
        "parentId": null
    },
    {
        "name": "Apple Watch",
        "description": "Apple's line of smartwatches",
        "parentId": null
    },
    {
        "name": "iPad",
        "description": "Apple's line of tablets",
        "parentId": null
    },
    {
        "name": "Phụ kiện",
        "description": "Accessories for Apple devices",
        "parentId": null
    }
];

const iphoneSeriesCategories = [{
        "name": "iPhone 16 Series",
        "description": "The latest iPhone 16 models",
        "parentId": "670b81bafe0ecb1fa79da1d2"
    },
    {
        "name": "iPhone 15 Series",
        "description": "iPhone 15 and its variations",
        "parentId": "670b81bafe0ecb1fa79da1d2"
    },
    {
        "name": "iPhone 14 Series",
        "description": "iPhone 14 and its variations",
        "parentId": "670b81bafe0ecb1fa79da1d2"
    },
    {
        "name": "iPhone 13 Series",
        "description": "iPhone 13 and its variations",
        "parentId": "670b81bafe0ecb1fa79da1d2"
    },
    {
        "name": "iPhone 12 Series",
        "description": "iPhone 12 and its variations",
        "parentId": "670b81bafe0ecb1fa79da1d2"
    },
    {
        "name": "iPhone 11 Series",
        "description": "iPhone 11 and its variations",
        "parentId": "670b81bafe0ecb1fa79da1d2"
    }
];

const attributeGroup = [{
        "groupName": "Thông tin hàng hóa",
        "groupIcon": null,
        "attributes": [{
                "propertyName": "Origin",
                "displayName": "Xuất xứ",
                "value": {
                    "displayValue": "Trung Quốc",
                }
            },
            {
                "propertyName": "Launch time",
                "displayName": "Thời điểm ra mắt",
                "value": {
                    "displayValue": "6.7 inch",
                }
            },
            {
                "propertyName": "Warranty period (month)",
                "displayName": "Thời gian bảo hành( tháng)",
                "value": {
                    "displayValue": "12",
                }
            }
        ]
    },

]

const exampleAttributeGroupData = {
    "groupName": "Color",
    "groupIcon": "color-icon.png",
    "attributes": [{
            "propertyName": "primaryColor",
            "displayName": " Primary Color",
            "value": "red",
        },
        {
            "propertyName": "secondaryColor",
            "displayName": "Secondary Color",
            "value": "blue",
        }
    ]
};

const newPromotion = {
    name: "Khuyến mãi mùa hè",
    type: "extra",
    urlImage: "https://example.com/images/summer-sale.jpg",
    urlPage: "https://example.com/summer-sale",
    discountPrice: 30000,
    appliedProduct: ["634e3b8964d5b02bc4f77bcd", "634e3b8b64d5b02bc4f77bce"],
    startDate: new Date("2024-06-01"),
    endDate: new Date("2024-06-30"),
    bundle_product: "634e3b8c64d5b02bc4f77bcf",
    quantity_limit: 2
}