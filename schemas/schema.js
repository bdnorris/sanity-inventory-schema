// First, we must import the schema creator
import createSchema from 'part:@sanity/base/schema-creator'

// Then import schema types from any plugins that might expose them
import schemaTypes from 'all:part:@sanity/base/schema-type'
import client from 'part:@sanity/base/client';
import groq from 'groq';

const isUniqueSku = (sku, context) => {
  const { document } = context;
  console.log('document', document);

  const id = document._id.replace(/^drafts\./, '');
  console.log('id', id);

  const params = {
    draft: `drafts.${id}`,
    published: id,
    sku,
  };
  console.log('params', params);

  /* groq */
  const query = groq`!defined(*[
    _type == 'item' &&
    !(_id in [$draft, $published]) &&
    sku == $sku
  ][0]._id)`;

  const request = client.fetch(query, params);
  console.log('request', request);
  return request
};

// Then we give our schema to the builder and provide the result to Sanity
export default createSchema({
  // We name our schema
  name: 'default',
  // Then proceed to concatenate our document type
  // to the ones provided by any plugins that are installed
  types: schemaTypes.concat([
    {
      title: "Item",
      name: "item",
      type: "document",
      fields: [
        {
          title: "Description",
          name: "description",
          type: "string"
        },
        {
          title: "Listed",
          name: "listed",
          type: "boolean",
        },
        {
          title: "Etsy URL",
          name: "etsyUrl",
          type: "url",
          hidden: ({ parent, value }) => value && !parent?.listed
        },
        {
          title: "Sold",
          name: "sold",
          type: "boolean",
          initialValue: false
        },
        {
          title: "Sold Date",
          name: "soldDate",
          type: "date",
          hidden: ({ parent, value }) => !value && !parent?.sold
        },
        {
          title: 'Photo',
          name: 'photo',
          type: 'image',
          options: {
            storeOriginalFilename: true // <-- Defaults to false
          },
        },
        {
          title: 'SKU',
          name: 'sku',
          type: 'string',
          initialValue: 'MMTYY001',
          validation: Rule => Rule.required().length(8).custom(async (value, context) => {
            const isUnique = await isUniqueSku(value, context);
            console.log('isUnique', isUnique);
            if (!isUnique) return 'SKU is not unique';
            return true;
          })
        },
        {
          title: "Photography Date",
          name: "photographyDate",
          type: "date"
        },
        {
          title: "Photography Set",
          name: "photographySet",
          type: "string"
        },
        {
          title: "Materials",
          name: "materials",
          type: "array",
          of: [
            { type: 'material' }
          ]
        },
        {
          title: "Color",
          name: "color",
          type: "array",
          of: [ { type: 'string' } ]
        },
        {
          title: "Weight",
          name: "weight",
          type: "string",
        },
        {
          title: "Storage Shelf",
          name: "storageShelf",
          type: "string",
        },
        {
          title: "Size",
          name: "size",
          type: "text",
        },
        {
          title: "Details",
          name: "details",
          type: "text",
        },
        {
          title: "Photo Range",
          name: "photoRange",
          type: "array",
          of: [ {type: 'string'} ]
        },
        {
          title: "Quantity",
          name: "quantity",
          type: "number",
          initialValue: 1
        },
        {
          title: "Price Paid",
          name: "pricePaid",
          type: "number",
        },
        {
          title: "Price Listed",
          name: "priceListed",
          type: "number",
        }
      ]
    },
    {
      title: "Material",
      name: "material",
      type: "document",
      fields: [
        {
          title: "Name",
          name: "name",
          type: "string"
        }
      ]
    }
  ])
})
