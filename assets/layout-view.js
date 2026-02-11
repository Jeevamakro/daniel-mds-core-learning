 document.addEventListener('DOMContentLoaded', function () {
    // Select all list and grid buttons (both desktop + mobile)
    console.log('iin');
    const listViewBtns = document.querySelectorAll('.list-view');
    const gridViewBtns = document.querySelectorAll('.grid-view');

    const collectionDiv = document.querySelector('.full-collection.enabled-sidebar');
    const productGrid = document.querySelector('#product-grid');

    if (listViewBtns.length && gridViewBtns.length && collectionDiv && productGrid) {
      //  Default state: Grid view active
      gridViewBtns.forEach(btn => btn.classList.add('active'));
      listViewBtns.forEach(btn => btn.classList.remove('active'));
      collectionDiv.classList.remove('collection-list-view');
      productGrid.classList.remove('collection-list-view');

      //  List view click — applies to all list view buttons
      listViewBtns.forEach(btn => {
        btn.addEventListener('click', function () {

          

          if(document.body.classList.contains('template-collection-collection-list-view')){
            document.querySelector('.b2b-list-view').classList.add('collection-listview-section');
          }else{
            collectionDiv.classList.add('collection-list-view');
            productGrid.classList.add('collection-list-view');
          }

          // Update active classes across all buttons
          listViewBtns.forEach(b => b.classList.add('active'));
          gridViewBtns.forEach(b => b.classList.remove('active'));
        });
      });

      //  Grid view click — applies to all grid view buttons
      gridViewBtns.forEach(btn => {
        btn.addEventListener('click', function () {
          console.log('click');
          collectionDiv.classList.remove('collection-list-view');
          productGrid.classList.remove('collection-list-view');

          // Update active classes across all buttons
          gridViewBtns.forEach(b => b.classList.add('active'));
          listViewBtns.forEach(b => b.classList.remove('active'));

          if(document.body.classList.contains('template-collection-collection-list-view')){
            document.querySelector('.b2b-list-view').classList.remove('collection-listview-section');
          }
        });
      });
    }
  });