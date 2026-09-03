export async function addItemSprites(evolutionDetails) {
  return Promise.all(
    evolutionDetails.map(async (detail) => {
      const evolutionItem = detail.item || detail.held_item;
      if (!evolutionItem?.url) return { ...detail, itemSprite: null };

      const itemResponse = await fetch(evolutionItem.url);
      const itemData = itemResponse.ok ? await itemResponse.json() : null;
      return { ...detail, itemSprite: itemData?.sprites?.default || null };
    })
  );
}
