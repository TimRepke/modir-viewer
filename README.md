# Joint Visualisation of Network and Text Data

Many large text collections exhibit graph structures, either inherent to the content itself or encoded in the metadata of the individual documents. Example graphs extracted from document collections are co-author networks, citation networks, or named-entity-cooccurrence networks. Furthermore, social networks can be extracted from email corpora, tweets, or social media. When it comes to visualising these large corpora, either the textual content or the network graph are used.

With MODiR (multi-objective dimensionality reduction), we propose to incorporate both, text and graph, to not only visualise the semantic information encoded in the documents' content but also the relationships expressed by the inherent network structure. To this end, we introduced a novel algorithm based on multi-objective optimisation to jointly position embedded documents and graph nodes in a two-dimensional landscape.

This repository contains the reference implementation for our IUI 2020 paper "Exploration Interface for Jointly Visualised Text and Graph Data".

For more information on that project, please visit https://hpi.de/naumann/s/modir.html   
... or clone this repo and open the `index.html` file in your browser.


```
@inproceedings{repke2020exploration,
  author = {Repke, Tim and Krestel, Ralf},
  booktitle = {Proceedings of the International Conference on Intelligent User Interfaces Companion (IUI)},
  title = {Exploration Interface for Jointly Visualised Text and Graph Data},
  year = {2020},
  publisher {ACM},
  pages={1--2}
}
```

## MODiR Landscape Prototype using D3
run server:

```
python server.py
```

navigate browser to http://0.0.0.0:8000/vis/index_mcc.html

## File Format

* docs (dict, keys are str IDs)
  * id (str, same as key)
  * date (str, '2004-01-01T12:12:00Z')
  * text (str)
  * category_a (str)
  * category_b (str)
  * keywords (list of str)
  * vec (list of float len 2, xy coordinates)
  * nodes (list of str(int), see node IDs)
* nodes (dict), keys are str(int)
  * id (str, same as key)
  * name (str)
  * vec (list of float len 2, xy coordinates)
  * weight (int)
  * email (str)
  * org (str)
  * sent (list)
  * received (list)
  * docs (list of str, doc IDs)
  * categories_a (list of str)
  * categories_b (list of str)
* edges (list of dict)
  * source (str, node id)
  * target (str, node id)
  * source_pos (list of float len 2, xy coordinates)
  * target_pos (list of float len 2, xy coordinates)
  * weight (int)
  * docs (list of str (doc IDs))
* category_a_index (dict)
  * keys: category (str)
  * values (list of doc IDs)
* category_b_index (dict)
  * keys: category (str)
  * values (list of doc IDs)
* word_grid (list (tr) of lists (td) of lists [keyword (str), count (int)])
* size (dict)
  * minx (float)
  * maxx (float)
  * miny (float)
  * maxy (float)
  * width (float)
  * height (float)
  * node_weights (dict)
    * min (int)
    * max (int)
    * range (int)
  * edge_weights (dict)
    * min (int)
    * max (int)
    * range (int)
  * word_grid (dict)
    * cols (int)
    * rows (int)
    * cell_width (float)
    * cell_height (float)
  
