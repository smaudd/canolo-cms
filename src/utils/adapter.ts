import { db } from "utils/firebase";
import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import { PageModule } from "interfaces/declarations";

interface Field {
  name: string;
  alias: string;
  type: string;
  order?: number;
  options?: Array<string>;
  relation?: { name: string; id: string };
  [index: string]: any;
}

interface Schema {
  name: string;
  alias: string;
  fields: Array<Field>;
}

interface Page {
  name: string;
  slug: string;
  state: string | boolean;
  lastUpdate: string;
  modules: Array<PageModule>;
  categories?: Array<string>;
}

function capitalize(string: string): string {
  return string[0].toUpperCase() + string.toLowerCase().slice(1, string.length);
}

const refreshPublished = async () => {
  const updates = collection(db, "updates");
  await setDoc(doc(updates, "publish"), { date: new Date().toISOString() });
};

export async function triggerBuild(message: string) {
  const confirmation = window.confirm(message);
  if (confirmation) {
    await refreshPublished();
    const response = await fetch(process.env.REACT_APP_DEPLOYHOOK || "", {
      method: "POST",
    });
    console.log(response);
  }
}

export async function createSchema(schema: Schema, id: any) {
  try {
    const modules = collection(db, "modules");
    const schemaAsObject: any = {};
    for (let field of schema.fields) {
      schemaAsObject[field.name] = {
        type: field.type,
        alias: field.alias,
        order: field.order,
      };
      const optionalFields = ["options", "relation"];
      for (let optionalField of optionalFields) {
        if (field[optionalField]) {
          console.log(field, optionalField);
          schemaAsObject[field.name][optionalField] = field[optionalField];
        }
      }
      // if (field.options) {
      //   schemaAsObject[field.name].options = field.options;
      // }
      // if (field.relation) {
      //   schemaAsObject[field.name].relation = field.relation;
      // }
    }
    schemaAsObject.meta = {
      name: schema.name,
      alias: capitalize(schema.alias),
    };
    await setDoc(id ? doc(modules, id) : doc(modules), schemaAsObject);
  } catch (err) {
    alert(err);
  }
}

export async function createCategories(categories: Array<string>) {
  console.log(categories);
  const col = collection(db, "categories");
  try {
    const valuesDoc = doc(col, "value");
    await setDoc(valuesDoc, { categories });
  } catch (err) {
    alert(err);
  }
}

export async function createCollection({
  structure,
  id,
}: {
  structure: Page;
  id: string | null;
}) {
  try {
    const collections = collection(db, "collections");
    const collectionRef = id ? doc(collections, id) : doc(collections);
    const formattedCollection = {
      name: structure.name,
      slug: structure.slug,
      lastUpdate: new Date().toISOString(),
      modules: structure.modules.map(({ component, props }) => ({
        component,
        props: {},
        visibility: 1,
      })),
    };
    await setDoc(collectionRef, formattedCollection);
  } catch (err) {
    alert(err);
  }
}

export async function createPage({
  page,
  id,
}: {
  page: Page;
  id: string | null;
}) {
  try {
    const pages = collection(db, "pages");
    const snippets = collection(db, "snippets");
    const pageRef = id ? doc(pages, id) : doc(pages);
    const formattedPage = {
      name: page.name,
      slug: page.slug,
      state: page.state,
      lastUpdate: new Date().toISOString(),
      modules: page.modules.map(
        ({ component, props, visibility, ref, name, id }) => {
          if (component === "Snippet") {
            return {
              component,
              ref: doc(snippets, ref?.id || id),
              name,
              visibility,
              props: {},
            };
          }
          return {
            component,
            visibility,
            props,
          };
        }
      ),
    };
    await setDoc(pageRef, formattedPage);
  } catch (err) {
    alert(err);
  }
}

const slugify = (text: string): string => {
  return (
    "/" +
    text
      .toString()
      .toLowerCase()
      .replace(/\s+/g, "-") // Replace spaces with -
      .replace(/[^\w\-]+/g, "") // Remove all non-word chars
      .replace(/\-\-+/g, "-") // Replace multiple - with single -
      .replace(/^-+/, "") // Trim - from start of text
      .replace(/-+$/, "")
  ); // Trim - from end of text
};

export async function createCollectionPage({
  page,
  id,
  collectionId,
  slug,
}: {
  page: Page;
  id: string | null;
  collectionId: string;
  slug?: string;
}) {
  try {
    const pages = collection(db, collectionId);
    const pageRef = id ? doc(pages, id) : doc(pages);
    const snippets = collection(db, "snippets");
    const formattedPage = {
      name: page.name,
      state: page.state,
      slug: slug + slugify(page.name),
      categories: page.categories || [],
      lastUpdate: new Date().toISOString(),
      modules: page.modules.map(
        ({ component, props, visibility, ref, name, id }) => {
          if (component === "Snippet") {
            return {
              component,
              ref: doc(snippets, ref?.id || id),
              name,
              visibility,
              props: {},
            };
          }
          return {
            component,
            visibility,
            props,
          };
        }
      ),
    };
    console.log(formattedPage);
    await setDoc(pageRef, formattedPage);
  } catch (err) {
    alert(err);
  }
}

export async function backupAll() {
  const backupsRef = collection(db, "backups");
  const { docs } = await getDocs(backupsRef);
  const [backup] = docs;
  const { collections } = backup.data();
  const promises = [];
  for (let name of collections) {
    const colRef = collection(db, name);
    promises.push(getDocs(colRef));
  }
  const result = await Promise.all(promises);
  console.log(
    result.map((r, index) => {
      const name = collections[index];
      return {
        name,
        docs: r.docs.map((d) => d.data()),
      };
    })
  );
}

export async function createSnippet({
  snippet,
  id,
}: {
  snippet: Page;
  id: string | null;
}) {
  try {
    const data = snippet.modules[0];
    const snippets = collection(db, "snippets");
    const snippetRef = id ? doc(snippets, id) : doc(snippets);
    const formattedSnippet = {
      name: snippet.name,
      component: data.component,
      props: data.props,
    };
    await setDoc(snippetRef, formattedSnippet);
  } catch (err) {
    alert(err);
  }
}
