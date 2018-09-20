function drawRectangle(annotation) {
  const rectangle = document.createElement('div');
  rectangle.style.height = `${annotation.height}%`;
  rectangle.style.width = `${annotation.width}%`;
  rectangle.style.backgroundColor = annotation.backgroundColor || 'transparent';

  rectangle.style.borderWidth = annotation.borderWidth;
  rectangle.style.borderColor = annotation.borderColor || 'transparent';
  rectangle.style.borderStyle = 'solid';

  rectangle.style.position = 'absolute';
  rectangle.style.top = `${annotation.offsetY}%`;
  rectangle.style.left = `${annotation.offsetX}%`;

  return rectangle;
}

class AnnotationLayer {
  static update(params) {
    console.log('update', params.page.pageNumber);

    // Clear all annotations
    params.div.innerHTML = '';

    const { annotations } = params;

    // Render all annotations
    annotations.forEach(annotation => {
      const rectangle = drawRectangle(annotation);

      params.div.appendChild(rectangle);
    });
  }
  static render(params) {
    console.log('render', params.page.pageNumber);
    const { annotations } = params;

    // Render all annotations
    annotations.forEach(annotation => {
      const rectangle = drawRectangle(annotation);

      params.div.appendChild(rectangle);
    });
  }
}

export { AnnotationLayer };
